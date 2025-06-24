import { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import { recipeService } from '../services/recipeService';
import { spoonacularApi } from '../services/spoonacularApi';
import './Chatbot.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userRecipes, setUserRecipes] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load user recipes when chat opens
  useEffect(() => {
    if (isOpen) {
      loadUserRecipes();
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hi there! I'm your RecipeHub AI assistant. I can help you with:\n\nRecipe Management: Create, edit, delete, and organize your recipes\nRecipe Search: Find recipes by ingredients, cuisine, or dietary needs\nRecipe Creation: Help you write and format new recipes\nCooking Tips: Get advice on techniques, substitutes, and meal planning\n\nWhat would you like to do today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  const loadUserRecipes = async () => {
    try {
      const recipes = await recipeService.getUserRecipes();
      setUserRecipes(recipes);
    } catch (error) {
      console.error('Error loading user recipes:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const botResponse = await generateSmartResponse(inputMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again or rephrase your question.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateSmartResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Recipe CRUD Operations
    if (message.includes('create') || message.includes('add') || message.includes('new recipe') || message.includes('write recipe')) {
      return "I can help you create a new recipe! Here's what I need:\n\nRecipe Name: What's the name of your dish?\nDescription: Brief description of the recipe\nIngredients: List of ingredients with amounts\nInstructions: Step-by-step cooking instructions\nPrep Time: How long to prepare (in minutes)\nCook Time: How long to cook (in minutes)\nServings: How many people it serves\nDifficulty: Easy, Medium, or Hard\nCuisine Type: Italian, Mexican, Asian, etc.\n\nYou can also tell me: 'I want to create a recipe for [dish name]' and I'll guide you through the process!";
    }

    if (message.includes('edit') || message.includes('update') || message.includes('modify') || message.includes('change')) {
      if (userRecipes.length === 0) {
        return "You don't have any recipes yet. Create your first recipe and then I can help you edit it!";
      }
      
      const recipeNames = userRecipes.map(r => r.name).join(', ');
      return `I can help you edit your recipes! You have ${userRecipes.length} recipe(s):\n\n${recipeNames}\n\nTell me which recipe you want to edit and what changes you'd like to make. For example: 'Edit my pasta recipe to add more garlic' or 'Update the cooking time for my chicken dish'`;
    }

    if (message.includes('delete') || message.includes('remove') || message.includes('trash')) {
      if (userRecipes.length === 0) {
        return "You don't have any recipes to delete yet.";
      }
      
      const recipeNames = userRecipes.map(r => r.name).join(', ');
      return `I can help you delete recipes. You have ${userRecipes.length} recipe(s):\n\n${recipeNames}\n\nTell me which recipe you want to delete. For example: 'Delete my pasta recipe' or 'Remove the chicken dish'`;
    }

    if (message.includes('my recipes') || message.includes('show my recipes') || message.includes('list my recipes')) {
      if (userRecipes.length === 0) {
        return "You don't have any recipes yet. Create your first recipe by saying 'I want to create a recipe'!";
      }
      
      const recipeList = userRecipes.map((recipe, index) => 
        `${index + 1}. ${recipe.name} - ${recipe.cuisine_type || 'Various'} cuisine, ${recipe.difficulty || 'Medium'} difficulty`
      ).join('\n');
      
      return `Here are your ${userRecipes.length} recipe(s):\n\n${recipeList}\n\nYou can ask me to edit, delete, or get details about any of these recipes!`;
    }

    // Enhanced Recipe Search and Discovery - Includes both database and API recipes
    if (message.includes('find') || message.includes('search') || message.includes('look for') || message.includes('recipe for')) {
      const searchTerms = extractSearchTerms(message);
      if (searchTerms.length > 0) {
        let response = "";
        let hasResults = false;

        // Search in user's database recipes first
        const dbResults = searchUserRecipes(searchTerms);
        if (dbResults.length > 0) {
          response += `📚 **Your Recipes** (${dbResults.length} found):\n`;
          const dbRecipeList = dbResults.map((recipe, index) => 
            `${index + 1}. ${recipe.name} - ${recipe.cuisine_type || 'Various'} cuisine, ${recipe.difficulty || 'Medium'} difficulty`
          ).join('\n');
          response += `${dbRecipeList}\n\n`;
          hasResults = true;
        }

        // Search in Spoonacular API
        try {
          const apiResults = await spoonacularApi.searchRecipes(searchTerms.join(' '), '', 5);
          if (apiResults.results && apiResults.results.length > 0) {
            response += `🌐 **Online Recipes** (${apiResults.results.length} found):\n`;
            const apiRecipeList = apiResults.results.map((recipe, index) => 
              `${index + 1}. ${recipe.title} - ${recipe.readyInMinutes} min, ${recipe.cuisines?.[0] || 'Various'}`
            ).join('\n');
            response += `${apiRecipeList}\n\n`;
            hasResults = true;
          }
        } catch (error) {
          console.error('API search error:', error);
        }

        if (hasResults) {
          response += "You can ask me for more details about any of these recipes!";
          return response;
        } else {
          return `I couldn't find any recipes for "${searchTerms.join(' ')}" in your database or online. Try different keywords or be more specific!`;
        }
      }
      
      return "I can help you find recipes! I'll search both your personal recipe database and online recipes.\n\nSearch by:\n• **Ingredients**: 'Find recipes with chicken and pasta'\n• **Cuisine**: 'Search for Italian recipes'\n• **Meal type**: 'Find quick dinner recipes'\n• **Dietary needs**: 'Search for vegetarian recipes'\n\nWhat would you like to find?";
    }

    // Search specifically in user's database
    if (message.includes('my database') || message.includes('in my recipes') || message.includes('from my collection')) {
      const searchTerms = extractSearchTerms(message);
      if (searchTerms.length > 0) {
        const dbResults = searchUserRecipes(searchTerms);
        if (dbResults.length > 0) {
          const recipeList = dbResults.map((recipe, index) => 
            `${index + 1}. ${recipe.name} - ${recipe.cuisine_type || 'Various'} cuisine, ${recipe.difficulty || 'Medium'} difficulty`
          ).join('\n');
          
          return `📚 Found ${dbResults.length} recipe(s) in your database for "${searchTerms.join(' ')}":\n\n${recipeList}\n\nYou can ask me to edit, delete, or get details about any of these recipes!`;
        } else {
          return `I couldn't find any recipes in your database for "${searchTerms.join(' ')}". Try different keywords or create a new recipe!`;
        }
      }
      
      return "I can search specifically in your recipe database! Tell me what you're looking for:\n\n• 'Find pasta recipes in my database'\n• 'Search for chicken dishes in my recipes'\n• 'Look for vegetarian recipes in my collection'\n\nWhat would you like to find in your recipes?";
    }

    // Ingredient Substitutes
    if (message.includes('substitute') || message.includes('replace') || message.includes('don\'t have') || message.includes('alternative')) {
      const ingredient = extractIngredient(message);
      if (ingredient) {
        try {
          const substitutes = await spoonacularApi.getIngredientSubstitutes(ingredient);
          if (substitutes.status === 'success' && substitutes.substitutes) {
            const substituteList = substitutes.substitutes.map((sub, index) => 
              `${index + 1}. ${sub}`
            ).join('\n');
            
            return `Here are substitutes for ${ingredient}:\n\n${substituteList}`;
          } else {
            return `I couldn't find specific substitutes for ${ingredient}, but you can try common alternatives or check our Ingredient Substitutes tool!`;
          }
        } catch (error) {
          return `For ${ingredient} substitutes, try our Ingredient Substitutes tool under Recipe -> Ingredient Substitutes in the navigation!`;
        }
      }
      
      return "I can help you find ingredient substitutes! Tell me what ingredient you need to replace. For example:\n\n'What can I substitute for butter?'\n'I don't have eggs, what can I use?'\n'Need a substitute for milk'\n\nWhat ingredient do you need help with?";
    }

    // Cooking Tips and Techniques
    if (message.includes('how to') || message.includes('cooking tip') || message.includes('technique') || message.includes('advice')) {
      return "I can help with cooking tips and techniques! Here are some areas I can assist with:\n\nKnife Skills: Chopping, slicing, dicing techniques\nSeasoning: How to properly season your food\nTemperature Control: Cooking temperatures and heat management\nTiming: How long to cook different foods\nMeal Planning: Planning weekly meals and shopping lists\nIngredient Prep: How to prepare and store ingredients\n\nWhat specific cooking technique would you like to learn about?";
    }

    // Meal Planning
    if (message.includes('meal plan') || message.includes('weekly menu') || message.includes('plan meals')) {
      return "I can help you with meal planning! Here's what I can assist with:\n\nWeekly Planning: Plan your meals for the week\nShopping Lists: Generate grocery lists from your meal plan\nBudget Planning: Plan meals within your budget\nDietary Planning: Plan meals for specific diets\nTime-Saving: Quick meal prep strategies\n\nYou can also use our Meal Planner feature under Planner -> Meal Planner for a full planning experience!\n\nWhat aspect of meal planning would you like help with?";
    }

    // Dietary Restrictions
    if (message.includes('vegetarian') || message.includes('vegan') || message.includes('gluten') || message.includes('dairy') || message.includes('allergy')) {
      return "I can help with dietary restrictions! Here are some options:\n\nVegetarian: Meat-free recipes with eggs and dairy\nVegan: Plant-based recipes without animal products\nGluten-Free: Recipes without gluten-containing ingredients\nDairy-Free: Recipes without milk, cheese, or butter\nLow-Carb: Reduced carbohydrate options\nKeto: High-fat, low-carb recipes\n\nYou can search for these in our recipe database or ask me for specific recommendations!\n\nWhat dietary preference are you looking for?";
    }

    // Greetings and General Help
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! How can I help you today? I can assist with:\n\nRecipe Management: Create, edit, delete your recipes\nRecipe Search: Find recipes by ingredients or cuisine (searches both your database and online)\nRecipe Creation: Help you write new recipes\nCooking Tips: Get advice on techniques and substitutes\nMeal Planning: Plan your weekly meals\n\nWhat would you like to do?";
    }

    if (message.includes('help') || message.includes('what can you do')) {
      return "Here's what I can help you with:\n\nRecipe Management\n- Create new recipes\n- Edit existing recipes\n- Delete recipes\n- List your recipes\n\nRecipe Discovery\n- Search your personal recipe database\n- Search online recipes from Spoonacular\n- Find recipes by ingredients, cuisine, or dietary needs\n- Get recipe recommendations\n\nCooking Assistance\n- Find ingredient substitutes\n- Get cooking tips and techniques\n- Meal planning advice\n- Dietary restriction guidance\n\nExamples:\n- 'Create a recipe for chicken pasta'\n- 'Find vegetarian dinner recipes'\n- 'Search for pasta in my database'\n- 'What can I substitute for butter?'\n- 'Show my recipes'\n\nWhat would you like to try?";
    }

    // Default response
    return "I'm here to help with all things cooking! Try asking me to:\n\nCreate a recipe: 'I want to create a recipe for pasta'\nFind recipes: 'Find vegetarian dinner recipes' (searches both your database and online)\nSearch your database: 'Find chicken recipes in my database'\nManage recipes: 'Show my recipes' or 'Edit my chicken recipe'\nGet cooking help: 'What can I substitute for eggs?'\nMeal planning: 'Help me plan meals for the week'\n\nWhat would you like to do?";
  };

  // Helper function to search in user's recipe database
  const searchUserRecipes = (searchTerms) => {
    if (!userRecipes || userRecipes.length === 0) return [];
    
    const searchString = searchTerms.join(' ').toLowerCase();
    
    return userRecipes.filter(recipe => {
      const recipeText = [
        recipe.name,
        recipe.description,
        recipe.cuisine_type,
        recipe.difficulty,
        recipe.ingredients ? JSON.stringify(recipe.ingredients) : '',
        recipe.instructions
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => recipeText.includes(term));
    });
  };

  const extractSearchTerms = (message) => {
    const searchKeywords = ['find', 'search', 'look for', 'recipe for', 'recipes with', 'show me'];
    let terms = [];
    
    for (const keyword of searchKeywords) {
      if (message.includes(keyword)) {
        const afterKeyword = message.split(keyword)[1];
        if (afterKeyword) {
          terms = afterKeyword.trim().split(/\s+/);
          break;
        }
      }
    }
    
    return terms.filter(term => term.length > 2);
  };

  const extractIngredient = (message) => {
    const substituteKeywords = ['substitute for', 'replace', 'don\'t have', 'alternative for'];
    
    for (const keyword of substituteKeywords) {
      if (message.includes(keyword)) {
        const afterKeyword = message.split(keyword)[1];
        if (afterKeyword) {
          return afterKeyword.trim().split(/\s+/)[0];
        }
      }
    }
    
    return null;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      {/* Chat Button */}
      <button 
        className={`chatbot-button ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        <FaComments className="chat-icon" />
        <span className="chat-label">Recipe AI Assistant</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <FaRobot className="bot-icon" />
              <span>Bot Assistance</span>
            </div>
            <button 
              className="close-button"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="chatbot-input">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about recipes, cooking tips, or meal planning..."
              className="message-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!inputMessage.trim() || isTyping}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
