from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
try:
    from motor.motor_asyncio import AsyncIOMotorClient
except Exception:
    AsyncIOMotorClient = None
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import asyncio
import bcrypt
import jwt
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


class UserMessage(BaseModel):
    text: str


class LlmChat:
    def __init__(self, api_key: Optional[str], session_id: str, system_message: str):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.provider: Optional[str] = None
        self.model: Optional[str] = None

    def with_model(self, provider: str, model: str) -> "LlmChat":
        self.provider = provider
        self.model = model
        return self

    async def send_message(self, user_message: UserMessage) -> str:
        if not self.api_key:
            raise ValueError("Missing EMERGENT_LLM_KEY")
        if self.provider == "openai":
            return await self._send_openai(user_message)
        raise ValueError("Unsupported provider")

    async def _send_openai(self, user_message: UserMessage) -> str:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._send_openai_sync, user_message)

    def _send_openai_sync(self, user_message: UserMessage) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": self.system_message},
                {"role": "user", "content": user_message.text},
            ],
        }
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
        choices = data.get("choices")
        if not choices:
            raise ValueError("No response from model")
        message = choices[0].get("message", {})
        content = message.get("content")
        if not content:
# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise RuntimeError("MONGO_URL environment variable is not set")
if AsyncIOMotorClient is None:
    raise RuntimeError("Missing dependency 'motor'. Install it with: pip install motor")
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test')]
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user: User

class HealthData(BaseModel):
    age: int
    gender: str
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    cholesterol_total: int
    cholesterol_ldl: Optional[int] = None
    cholesterol_hdl: Optional[int] = None
    smoking: str
    diabetes: str
    family_history: str
    bmi: float
    exercise_frequency: str
    ecg_data: Optional[str] = None
    stress_level: str
    diet_quality: str

class PredictionRequest(BaseModel):
    health_data: HealthData

class PredictionResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    health_data: HealthData
    risk_assessment: str
    recommendations: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    return jwt.encode(
        {"user_id": user_id, "exp": expiration},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API Routes
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name
    )
    
    user_doc = user.model_dump()
    user_doc['password'] = hash_password(user_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user.id)
    return AuthResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(
        id=user_doc['id'],
        email=user_doc['email'],
        full_name=user_doc['full_name'],
        created_at=datetime.fromisoformat(user_doc['created_at']) if isinstance(user_doc['created_at'], str) else user_doc['created_at']
    )
    
    token = create_token(user.id)
    return AuthResponse(token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.post("/predict", response_model=PredictionResult)
async def predict_heart_attack(request: PredictionRequest, user_id: str = Depends(get_current_user)):
    health_data = request.health_data
    
    # Build comprehensive prompt for GPT-5
    prompt = f"""You are a medical AI assistant specializing in cardiovascular health risk assessment. Analyze the following patient data and provide a comprehensive heart attack risk assessment.

Patient Information:
- Age: {health_data.age}
- Gender: {health_data.gender}
- Blood Pressure: {health_data.blood_pressure_systolic}/{health_data.blood_pressure_diastolic} mmHg
- Total Cholesterol: {health_data.cholesterol_total} mg/dL
{f'- LDL Cholesterol: {health_data.cholesterol_ldl} mg/dL' if health_data.cholesterol_ldl else ''}
{f'- HDL Cholesterol: {health_data.cholesterol_hdl} mg/dL' if health_data.cholesterol_hdl else ''}
- Smoking Status: {health_data.smoking}
- Diabetes Status: {health_data.diabetes}
- Family History of Heart Disease: {health_data.family_history}
- BMI: {health_data.bmi}
- Exercise Frequency: {health_data.exercise_frequency}
- Stress Level: {health_data.stress_level}
- Diet Quality: {health_data.diet_quality}
{f'- ECG Notes: {health_data.ecg_data}' if health_data.ecg_data else ''}

Please provide:
1. Overall Risk Assessment (Low/Moderate/High/Very High) with percentage if applicable
2. Key Risk Factors identified
3. Protective Factors (if any)
4. Detailed lifestyle recommendations
5. Medical follow-up suggestions

Format your response clearly with sections for Risk Assessment and Recommendations."""

    try:
        # Initialize LLM Chat with GPT-5
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=f"prediction-{user_id}-{uuid.uuid4()}",
            system_message="You are a medical AI assistant specializing in cardiovascular health risk assessment. Provide detailed, evidence-based analysis."
        ).with_model("openai", "gpt-5")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse response
        response_text = response if isinstance(response, str) else str(response)
        
        # Split into risk assessment and recommendations
        parts = response_text.split("Recommendations", 1)
        risk_assessment = parts[0].replace("Risk Assessment", "").strip()
        recommendations = parts[1].strip() if len(parts) > 1 else response_text
        
        # Save prediction
        prediction = PredictionResult(
            user_id=user_id,
            health_data=health_data,
            risk_assessment=risk_assessment,
            recommendations=recommendations
        )
        
        prediction_doc = prediction.model_dump()
        prediction_doc['created_at'] = prediction_doc['created_at'].isoformat()
        prediction_doc['health_data'] = health_data.model_dump()
        
        await db.predictions.insert_one(prediction_doc)
        
        return prediction
        
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@api_router.get("/predictions", response_model=List[PredictionResult])
async def get_user_predictions(user_id: str = Depends(get_current_user)):
    predictions = await db.predictions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for pred in predictions:
        if isinstance(pred['created_at'], str):
            pred['created_at'] = datetime.fromisoformat(pred['created_at'])
    
    return predictions

@api_router.get("/predictions/{prediction_id}", response_model=PredictionResult)
async def get_prediction(prediction_id: str, user_id: str = Depends(get_current_user)):
    prediction = await db.predictions.find_one(
        {"id": prediction_id, "user_id": user_id},
        {"_id": 0}
    )
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    if isinstance(prediction['created_at'], str):
        prediction['created_at'] = datetime.fromisoformat(prediction['created_at'])
    
    return PredictionResult(**prediction)

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()