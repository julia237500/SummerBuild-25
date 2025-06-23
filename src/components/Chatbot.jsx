import { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import './Chatbot.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hi there! 👋 I'm your RecipeHub assistant. I can help you find recipes, cooking tips, and answer questions about ingredients. What would you like to know?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

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

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Recipe search and discovery
    if (message.includes('recipe') || message.includes('cook') || message.includes('food') || message.includes('dish')) {
      // Specific recipe types
      if (message.includes('breakfast') || message.includes('morning')) {
        return "🍳 For breakfast recipes, try searching for 'eggs', 'pancakes', 'oatmeal', or 'smoothie' in our recipe search. We have quick morning meals that take 15 minutes or less! Go to Recipe → Search Recipes in the navigation.";
      }
      
      if (message.includes('lunch') || message.includes('midday')) {
        return "🥪 Looking for lunch ideas? Search for 'sandwich', 'salad', 'soup', or 'pasta' in our recipe search. We have healthy, quick lunch options that are perfect for busy days!";
      }
      
      if (message.includes('dinner') || message.includes('evening') || message.includes('night')) {
        return "🍽️ Dinner time! Search for 'chicken', 'beef', 'fish', 'vegetarian', or 'pasta' in our recipe search. We have everything from quick 30-minute meals to impressive dinner party dishes!";
      }
      
      if (message.includes('dessert') || message.includes('sweet') || message.includes('cake') || message.includes('cookie')) {
        return "🍰 Sweet tooth? Search for 'chocolate', 'cake', 'cookie', 'ice cream', or 'pie' in our recipe search. We have decadent desserts and healthier sweet treats too!";
      }
      
      if (message.includes('quick') || message.includes('fast') || message.includes('easy') || message.includes('simple')) {
        return "⚡ Need something quick? Search for 'quick', 'easy', or '30 minute' recipes in our search. We have tons of recipes that take 30 minutes or less to prepare!";
      }
      
      if (message.includes('healthy') || message.includes('low calorie') || message.includes('diet')) {
        return "🥗 For healthy recipes, search for 'healthy', 'low calorie', 'vegetarian', or 'salad' in our recipe search. We also have filters for dietary preferences like gluten-free and vegan!";
      }
      
      if (message.includes('italian') || message.includes('pasta') || message.includes('pizza')) {
        return "🇮🇹 Italian food lover? Search for 'pasta', 'pizza', 'risotto', or 'italian' in our recipe search. We have authentic Italian dishes and modern twists on classics!";
      }
      
      if (message.includes('asian') || message.includes('chinese') || message.includes('japanese') || message.includes('thai') || message.includes('indian')) {
        return "🍜 Craving Asian cuisine? Search for 'asian', 'chinese', 'japanese', 'thai', 'indian', or 'curry' in our recipe search. We have authentic recipes from across Asia!";
      }
      
      if (message.includes('mexican') || message.includes('taco') || message.includes('burrito')) {
        return "🌮 Mexican food fan? Search for 'mexican', 'taco', 'burrito', 'enchilada', or 'guacamole' in our recipe search. We have spicy, flavorful Mexican dishes!";
      }
      
      if (message.includes('vegetarian') || message.includes('vegan')) {
        return "🥬 Plant-based eating? Search for 'vegetarian', 'vegan', or 'plant-based' in our recipe search. We have delicious meat-free options that are full of flavor!";
      }
      
      if (message.includes('gluten') || message.includes('celiac')) {
        return "🌾 Gluten-free needs? Search for 'gluten-free' in our recipe search. We have plenty of delicious gluten-free options for every meal!";
      }
      
      if (message.includes('popular') || message.includes('trending') || message.includes('best')) {
        return "🔥 Want to see what's popular? Our recipe search defaults to showing the most popular recipes first! You can also sort by 'popularity' to see trending dishes.";
      }
      
      if (message.includes('new') || message.includes('recent') || message.includes('latest')) {
        return "🆕 Looking for new recipes? Our database is constantly updated with fresh, exciting recipes. Try searching for seasonal ingredients or trending cuisines!";
      }
      
      if (message.includes('seasonal') || message.includes('spring') || message.includes('summer') || message.includes('fall') || message.includes('winter')) {
        return "🍂 Seasonal cooking is wonderful! Search for seasonal ingredients like 'pumpkin' (fall), 'berries' (summer), 'asparagus' (spring), or 'root vegetables' (winter) in our recipe search.";
      }
      
      if (message.includes('budget') || message.includes('cheap') || message.includes('affordable') || message.includes('inexpensive')) {
        return "💰 Cooking on a budget? Search for 'budget-friendly', 'cheap', or specific affordable ingredients like 'beans', 'rice', 'pasta', or 'eggs' in our recipe search.";
      }
      
      if (message.includes('party') || message.includes('entertaining') || message.includes('guests')) {
        return "🎉 Hosting a party? Search for 'appetizer', 'finger food', 'party', or 'crowd-pleaser' in our recipe search. We have perfect dishes for entertaining!";
      }
      
      if (message.includes('kid') || message.includes('children') || message.includes('family')) {
        return "👶 Cooking for kids? Search for 'kid-friendly', 'family', or 'simple' in our recipe search. We have recipes that kids love and can help prepare!";
      }
      
      // General recipe guidance
      const responses = [
        "🍳 I can help you find the perfect recipe! Try searching for specific ingredients, cuisines, or meal types in our recipe search. For example: 'chicken pasta', 'vegetarian dinner', 'quick breakfast', or 'italian food'. Go to Recipe → Search Recipes in the navigation!",
        "👨‍🍳 Great! We have thousands of recipes in our database. You can search by ingredients you have, cuisine type, dietary preferences, or cooking time. What type of food are you in the mood for today?",
        "🥘 Cooking is such a wonderful activity! Our recipe search lets you find dishes by ingredients, cuisine, dietary needs, or cooking time. Try searching for something specific like 'quick vegetarian dinner' or 'italian pasta'!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Ingredient-related responses
    if (message.includes('ingredient') || message.includes('substitute') || message.includes('replace') || message.includes('don\'t have')) {
      if (message.includes('butter') || message.includes('oil')) {
        return "🧈 Need a butter substitute? Try olive oil, coconut oil, applesauce (for baking), or avocado. Check out our Ingredient Substitutes tool under Recipe → Ingredient Substitutes for detailed alternatives!";
      }
      
      if (message.includes('egg') || message.includes('eggs')) {
        return "🥚 No eggs? Try flax seeds, chia seeds, banana, or applesauce as substitutes. The ratio varies by recipe type. Use our Ingredient Substitutes tool for specific measurements!";
      }
      
      if (message.includes('milk') || message.includes('dairy')) {
        return "🥛 Dairy-free options include almond milk, oat milk, coconut milk, or soy milk. Each works differently in recipes. Check our Ingredient Substitutes tool for the best alternatives!";
      }
      
      if (message.includes('flour') || message.includes('gluten')) {
        return "🌾 Gluten-free flour alternatives include almond flour, coconut flour, rice flour, or gluten-free all-purpose flour. Use our Ingredient Substitutes tool for proper ratios!";
      }
      
      return "🔄 Need ingredient substitutes? We have a great tool for that! Go to Recipe → Ingredient Substitutes in the navigation menu. Just enter the ingredient you need to replace and we'll suggest alternatives with proper ratios.";
    }
    
    // Dietary restrictions
    if (message.includes('vegetarian') || message.includes('vegan') || message.includes('gluten') || message.includes('diet') || message.includes('allergy')) {
      if (message.includes('vegetarian')) {
        return "🥬 Vegetarian options abound! Search for 'vegetarian' in our recipe search. We have meat-free dishes that are protein-rich using beans, lentils, eggs, and dairy. Try 'vegetarian pasta', 'bean recipes', or 'vegetarian dinner'!";
      }
      
      if (message.includes('vegan')) {
        return "🌱 Vegan cooking is exciting! Search for 'vegan' in our recipe search. We have plant-based versions of classic dishes using tofu, tempeh, nuts, and vegetables. Try 'vegan curry', 'plant-based protein', or 'vegan dessert'!";
      }
      
      if (message.includes('gluten') || message.includes('celiac')) {
        return "🌾 Gluten-free cooking is easier than ever! Search for 'gluten-free' in our recipe search. We have naturally gluten-free dishes and adapted versions of favorites. Try 'gluten-free pasta', 'quinoa recipes', or 'gluten-free baking'!";
      }
      
      if (message.includes('dairy') || message.includes('lactose')) {
        return "🥛 Dairy-free options are plentiful! Search for 'dairy-free' or 'vegan' in our recipe search. We have delicious alternatives using plant-based milks, nut cheeses, and coconut products!";
      }
      
      return "🥗 We support various dietary preferences! You can filter recipes by vegetarian, vegan, gluten-free, dairy-free, and other dietary restrictions. Use our advanced search filters to find exactly what you need.";
    }
    
    // Meal planning
    if (message.includes('meal') || message.includes('plan') || message.includes('weekly') || message.includes('menu')) {
      if (message.includes('plan') || message.includes('weekly')) {
        return "📅 Meal planning is a game-changer! Check out our Meal Planner feature under the Planner dropdown. You can plan your weekly meals, create shopping lists, and save time and money. It's perfect for busy families!";
      }
      
      if (message.includes('shopping') || message.includes('grocery')) {
        return "🛒 Our Meal Planner automatically generates shopping lists based on your planned meals! Go to Planner → Meal Planner to create your weekly plan and get an organized grocery list.";
      }
      
      if (message.includes('budget') || message.includes('save money')) {
        return "💰 Meal planning helps you save money! Our Meal Planner lets you plan affordable meals and create efficient shopping lists. You'll reduce food waste and stick to your budget!";
      }
      
      return "🍽️ Meal planning is a great way to stay organized! Check out our Meal Planner feature under the Planner dropdown. You can plan your weekly meals and create shopping lists.";
    }
    
    // Cooking techniques and tips
    if (message.includes('how to') || message.includes('cooking tip') || message.includes('technique')) {
      if (message.includes('knife') || message.includes('cut') || message.includes('chop')) {
        return "🔪 Knife skills are essential! Always use a sharp knife and keep your fingers curled under. For chopping, use a rocking motion. For slicing, use a forward motion. Practice makes perfect!";
      }
      
      if (message.includes('season') || message.includes('salt') || message.includes('spice')) {
        return "🧂 Seasoning is key! Salt enhances flavors, so season in layers. Taste as you cook and adjust. Don't forget acid (lemon, vinegar) and herbs for brightness!";
      }
      
      if (message.includes('temperature') || message.includes('heat') || message.includes('cook')) {
        return "🌡️ Temperature control is crucial! High heat for searing, medium for sautéing, low for simmering. Use a thermometer for meats. Remember: you can always add heat, but you can't take it away!";
      }
      
      if (message.includes('time') || message.includes('duration') || message.includes('how long')) {
        return "⏰ Cooking times vary! Check our recipe details for specific timing. Remember: prep time + cook time = total time. Always read the full recipe before starting!";
      }
      
      return "👨‍🍳 Great cooking question! I can help with techniques, timing, and tips. Could you be more specific about what you'd like to learn? For example: knife skills, seasoning, temperature control, or timing?";
    }
    
    // General cooking questions
    if (message.includes('how') || message.includes('what') || message.includes('why') || message.includes('when')) {
      const responses = [
        "🤔 That's a great question! I'm here to help with cooking tips and recipe guidance. Could you be more specific about what you'd like to know? For example: recipe recommendations, cooking techniques, or ingredient help?",
        "💡 I'd love to help you with that! Our website has lots of resources for cooking enthusiasts. What specific aspect would you like to learn more about?",
        "🎯 Great question! I can help you navigate our features and find the information you need. What would you like to know more about?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! 👋 How can I help you today? I can assist with finding recipes, cooking tips, ingredient substitutes, meal planning, and more! Just ask me anything about cooking!";
    }
    
    // Default response
    const defaultResponses = [
      "I'm here to help you with all things cooking! Try asking about specific recipes (like 'quick dinner ideas' or 'vegetarian pasta'), cooking techniques, ingredient substitutes, or meal planning.",
      "That's interesting! I can help you find recipes, suggest ingredient substitutes, answer cooking questions, or guide you to meal planning. What would you like to explore?",
      "I'm your cooking assistant! I can help you discover new recipes, find ingredient alternatives, get cooking tips, and plan meals. What can I help you with today?"
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
        <span className="chat-label">Need help?</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <FaRobot className="bot-icon" />
              <span>RecipeHub Assistant</span>
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
                  <p>{message.text}</p>
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
              placeholder="Type your message..."
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