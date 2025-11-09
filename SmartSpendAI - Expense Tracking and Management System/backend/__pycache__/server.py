"from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=[\"bcrypt\"], deprecated=\"auto\")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = \"HS256\"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix=\"/api\")

# Predefined expense categories
PREDEFINED_CATEGORIES = [
    \"Food & Dining\",
    \"Transportation\",
    \"Shopping\",
    \"Entertainment\",
    \"Bills & Utilities\",
    \"Healthcare\",
    \"Travel\",
    \"Education\",
    \"Personal Care\",
    \"Other\"
]

# ============= Models =============

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    token: str

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    category: Optional[str] = None
    date: Optional[datetime] = None
    use_ai_categorization: bool = False

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[datetime] = None

class Expense(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    description: str
    amount: float
    category: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ai_categorized: bool = False

class ExpenseResponse(BaseModel):
    id: str
    description: str
    amount: float
    category: str
    date: str
    ai_categorized: bool

# ============= Utility Functions =============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {\"sub\": user_id, \"exp\": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get(\"sub\")
        if user_id is None:
            raise HTTPException(status_code=401, detail=\"Invalid authentication credentials\")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail=\"Token has expired\")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail=\"Invalid authentication credentials\")

async def categorize_expense_with_ai(description: str) -> str:
    \"\"\"Use Claude AI to categorize an expense based on its description\"\"\"
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        
        system_message = f\"\"\"You are an expense categorization assistant. Given an expense description, categorize it into ONE of these categories:
{', '.join(PREDEFINED_CATEGORIES)}

Rules:
- Return ONLY the category name, nothing else
- Choose the most appropriate category
- If unsure, use 'Other'
\"\"\"
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f\"categorize-{uuid.uuid4()}\",
            system_message=system_message
        ).with_model(\"anthropic\", \"claude-3-7-sonnet-20250219\")
        
        user_message = UserMessage(text=f\"Categorize this expense: {description}\")
        response = await chat.send_message(user_message)
        
        category = response.strip()
        
        # Validate the category
        if category in PREDEFINED_CATEGORIES:
            return category
        else:
            # Try to find a close match
            category_lower = category.lower()
            for cat in PREDEFINED_CATEGORIES:
                if cat.lower() in category_lower or category_lower in cat.lower():
                    return cat
            return \"Other\"
            
    except Exception as e:
        logger.error(f\"AI categorization error: {str(e)}\")
        return \"Other\"

# ============= Authentication Routes =============

@api_router.post(\"/auth/signup\", response_model=UserResponse)
async def signup(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({\"email\": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail=\"Email already registered\")
    
    # Create new user
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token(user.id)
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        token=token
    )

@api_router.post(\"/auth/login\", response_model=UserResponse)
async def login(credentials: UserLogin):
    # Find user
    user = await db.users.find_one({\"email\": credentials.email})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail=\"Invalid email or password\")
    
    # Create token
    token = create_access_token(user['id'])
    
    return UserResponse(
        id=user['id'],
        name=user['name'],
        email=user['email'],
        token=token
    )

# ============= Expense Routes =============

@api_router.get(\"/expenses\", response_model=List[ExpenseResponse])
async def get_expenses(user_id: str = Depends(get_current_user)):
    expenses = await db.expenses.find({\"user_id\": user_id}, {\"_id\": 0}).to_list(1000)
    
    # Convert datetime to string for response
    for expense in expenses:
        if isinstance(expense['date'], str):
            expense['date'] = datetime.fromisoformat(expense['date']).isoformat()
        else:
            expense['date'] = expense['date'].isoformat()
    
    return expenses

@api_router.post(\"/expenses\", response_model=ExpenseResponse)
async def create_expense(expense_data: ExpenseCreate, user_id: str = Depends(get_current_user)):
    # Determine category
    ai_categorized = False
    if expense_data.use_ai_categorization and not expense_data.category:
        category = await categorize_expense_with_ai(expense_data.description)
        ai_categorized = True
    else:
        category = expense_data.category or \"Other\"
    
    # Create expense
    expense = Expense(
        user_id=user_id,
        description=expense_data.description,
        amount=expense_data.amount,
        category=category,
        date=expense_data.date or datetime.now(timezone.utc),
        ai_categorized=ai_categorized
    )
    
    expense_dict = expense.model_dump()
    expense_dict['date'] = expense_dict['date'].isoformat()
    expense_dict['created_at'] = expense_dict['created_at'].isoformat()
    
    await db.expenses.insert_one(expense_dict)
    
    return ExpenseResponse(
        id=expense.id,
        description=expense.description,
        amount=expense.amount,
        category=expense.category,
        date=expense.date.isoformat(),
        ai_categorized=ai_categorized
    )

@api_router.put(\"/expenses/{expense_id}\", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    expense_data: ExpenseUpdate,
    user_id: str = Depends(get_current_user)
):
    # Find expense
    expense = await db.expenses.find_one({\"id\": expense_id, \"user_id\": user_id})
    if not expense:
        raise HTTPException(status_code=404, detail=\"Expense not found\")
    
    # Update fields
    update_dict = {}
    if expense_data.description is not None:
        update_dict['description'] = expense_data.description
    if expense_data.amount is not None:
        update_dict['amount'] = expense_data.amount
    if expense_data.category is not None:
        update_dict['category'] = expense_data.category
    if expense_data.date is not None:
        update_dict['date'] = expense_data.date.isoformat()
    
    if update_dict:
        await db.expenses.update_one(
            {\"id\": expense_id, \"user_id\": user_id},
            {\"$set\": update_dict}
        )
    
    # Get updated expense
    updated_expense = await db.expenses.find_one({\"id\": expense_id, \"user_id\": user_id})
    
    return ExpenseResponse(
        id=updated_expense['id'],
        description=updated_expense['description'],
        amount=updated_expense['amount'],
        category=updated_expense['category'],
        date=updated_expense['date'] if isinstance(updated_expense['date'], str) else updated_expense['date'].isoformat(),
        ai_categorized=updated_expense.get('ai_categorized', False)
    )

@api_router.delete(\"/expenses/{expense_id}\")
async def delete_expense(expense_id: str, user_id: str = Depends(get_current_user)):
    result = await db.expenses.delete_one({\"id\": expense_id, \"user_id\": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=\"Expense not found\")
    return {\"message\": \"Expense deleted successfully\"}

@api_router.get(\"/categories\")
async def get_categories():
    return {\"categories\": PREDEFINED_CATEGORIES}

# ============= Health Check =============

@api_router.get(\"/\")
async def root():
    return {\"message\": \"SmartSpendAI API\", \"status\": \"running\"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
"