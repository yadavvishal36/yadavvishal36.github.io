import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, LogOut, Trash2, Edit, Sparkles, DollarSign, TrendingUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [useAI, setUseAI] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axios.post(
        `${API}/expenses`,
        {
          description,
          amount: parseFloat(amount),
          category: !useAI ? category : null,
          date: new Date(date).toISOString(),
          use_ai_categorization: useAI,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchExpenses();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axios.put(
        `${API}/expenses/${editingExpense.id}`,
        {
          description,
          amount: parseFloat(amount),
          category,
          date: new Date(date).toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchExpenses();
      setIsEditDialogOpen(false);
      resetForm();
      setEditingExpense(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await axios.delete(`${API}/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const openEditDialog = (expense) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(new Date(expense.date).toISOString().split('T')[0]);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setUseAI(false);
    setError('');
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryBreakdown = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SmartSpendAI</h1>
              <p className="text-xs text-gray-400">Welcome, {userData.name}!</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-slate-700"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700" data-testid="total-expenses-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="total-expenses-amount">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-gray-400 mt-1">{expenses.length} transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700" data-testid="top-category-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Top Category</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="top-category-name">{topCategory?.[0] || 'N/A'}</div>
              <p className="text-xs text-gray-400 mt-1">{topCategory ? `$${topCategory[1].toFixed(2)}` : '$0.00'}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700" data-testid="ai-categorized-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">AI Categorized</CardTitle>
              <Sparkles className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="ai-categorized-count">
                {expenses.filter((e) => e.ai_categorized).length}
              </div>
              <p className="text-xs text-gray-400 mt-1">Smart categorization</p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700" data-testid="expenses-table-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Your Expenses</CardTitle>
                <CardDescription className="text-gray-400">Track and manage all your expenses</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    onClick={resetForm}
                    data-testid="add-expense-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white" data-testid="add-expense-dialog">
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                  </DialogHeader>
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm" data-testid="add-expense-error">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleAddExpense} className="space-y-4" data-testid="add-expense-form">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="e.g., Lunch at restaurant"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="bg-slate-900/50 border-slate-600"
                        data-testid="expense-description-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="bg-slate-900/50 border-slate-600"
                        data-testid="expense-amount-input"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="use-ai"
                        checked={useAI}
                        onCheckedChange={setUseAI}
                        data-testid="ai-categorization-switch"
                      />
                      <Label htmlFor="use-ai" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        Use AI Categorization
                      </Label>
                    </div>
                    {!useAI && (
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory} required>
                          <SelectTrigger className="bg-slate-900/50 border-slate-600" data-testid="expense-category-select">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat} data-testid={`category-option-${cat}`}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="bg-slate-900/50 border-slate-600"
                        data-testid="expense-date-input"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        data-testid="submit-expense-button"
                      >
                        {isLoading ? 'Adding...' : 'Add Expense'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-gray-400" data-testid="no-expenses-message">
                <p>No expenses yet. Click "Add Expense" to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Description</TableHead>
                      <TableHead className="text-gray-300">Category</TableHead>
                      <TableHead className="text-gray-300 text-right">Amount</TableHead>
                      <TableHead className="text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id} className="border-slate-700 hover:bg-slate-700/50" data-testid={`expense-row-${expense.id}`}>
                        <TableCell className="text-gray-300">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white font-medium">{expense.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-purple-500/50 text-purple-300"
                            data-testid={`expense-category-${expense.id}`}
                          >
                            {expense.ai_categorized && (
                              <Sparkles className="w-3 h-3 mr-1 text-green-400" />
                            )}
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-white font-semibold" data-testid={`expense-amount-${expense.id}`}>
                          ${expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                              onClick={() => openEditDialog(expense)}
                              data-testid={`edit-expense-${expense.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                              onClick={() => handleDeleteExpense(expense.id)}
                              data-testid={`delete-expense-${expense.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white" data-testid="edit-expense-dialog">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm" data-testid="edit-expense-error">
                {error}
              </div>
            )}
            <form onSubmit={handleEditExpense} className="space-y-4" data-testid="edit-expense-form">
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  placeholder="e.g., Lunch at restaurant"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600"
                  data-testid="edit-expense-description-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount ($)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600"
                  data-testid="edit-expense-amount-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600" data-testid="edit-expense-category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600"
                  data-testid="edit-expense-date-input"
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  data-testid="submit-edit-expense-button"
                >
                  {isLoading ? 'Updating...' : 'Update Expense'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;