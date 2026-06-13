import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Bot } from 'lucide-react';

// Rule-based sustainability advice database for local fallback
const ADVICE_DB = {
  transport: {
    gas: [
      "Transportation accounts for {pct}% of your annual emissions. Upgrading your gasoline vehicle to an Electric Vehicle (EV) could reduce your emissions by up to 1,200 kg CO₂ annually based on your weekly driving distance of {val} miles.",
      "Reducing two weekly car commutes of {val} miles by carpools or transit would lower your carbon footprint by approximately {save} kg CO₂/year.",
      "Walking or cycling for trips under 2 miles instead of driving your gasoline car can save about 50 kg of CO₂ every year."
    ],
    electric: [
      "Excellent job choosing an EV! Your transportation footprint is relatively low, but you can decrease it further by charging during off-peak hours (cleaner grid mix).",
      "Combine trips and use public transit when traveling to dense urban centers to optimize your commute efficiency.",
    ],
    none: [
      "Since you do not own a personal vehicle, your transportation footprint is minimal! You are saving over 3,000 kg CO₂ per year compared to the average car driver."
    ],
  },
  energy: [
    "Your home energy bill (${val}/mo) is a primary driver of your score. Lowering your thermostat by 2°F in winter and raising it by 2°F in summer can save around 200 kg CO₂/year.",
    "Upgrading your standard appliances to Energy Star certified models can trim home energy emissions by 150 kg CO₂ annually.",
    "Unplugging electronics on standby ('phantom load') can save up to 45 kg CO₂/year."
  ],
  food: {
    vegetarian: [
      "Awesome work keeping a plant-based diet! Vegetarian diets produce 50% fewer emissions than meat-heavy diets. You are saving roughly 2,000 kg CO₂ annually compared to meat-rich alternatives.",
      "Try to increase your organic/local food sourcing from {val}% to 70% to save an extra 100 kg CO₂ annually."
    ],
    mixed: [
      "Your mixed diet produces about 2,500 kg CO₂/year. Incorporating 'Meatless Mondays' (vegetarian just one day a week) would reduce your dietary footprint by about 250 kg CO₂/year.",
      "Sourcing more local foods (aiming for 50%+ local) reduces transit-miles of your groceries, cutting emissions by 120 kg CO₂ annually."
    ],
    nonVeg: [
      "Your meat-heavy diet accounts for 3,500 kg CO₂/year. Replacing beef or lamb meals with chicken or fish twice a week can trim over 400 kg CO₂ annually.",
      "Consider shifting to a mixed diet to save over 1,000 kg CO₂ annually, significantly boosting your overall Carbon Score."
    ]
  },
  shopping: [
    "Your monthly spending on clothes (${val}) generates production emissions. Shopping secondhand or buying durable clothes that last 3+ years reduces clothing carbon footprints by 60%.",
    "Reduce electronics turnover: keeping your smartphone and laptop for 4 years instead of 2 years halves their lifetime manufacturing footprint, saving up to 180 kg CO₂."
  ],
  waste: [
    "Since your recycling is {val}, there is room to improve. Upgrading to full recycling habits cuts packaging waste emissions by 150 kg CO₂ annually.",
    "Reducing single-use plastics can cut waste emissions by up to 200 kg CO₂/year. Switch to solid soap bars and reusable canvas bags.",
    "Food waste segregation composts organic matter aerobically, avoiding methane releases. Segregating waste saves about 50 kg CO₂/year."
  ]
};

export default function Coach() {
  const [results, setResults] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      text: "Hello! I am your Gemini Sustainability Coach. I've reviewed your footprint details. How can I help you reduce your carbon score today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const data = localStorage.getItem('greeplus_footprint');
    if (data) {
      setResults(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!results) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-beige-deep bg-cream p-12 text-center flex flex-col items-center gap-6">
        <div className="size-16 rounded-md bg-canvas border border-beige-deep flex items-center justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-8"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l-1.813-5.096L2 14l5.187-1.808L9 7l1.813 5.192L16 14l-6.187 1.904z" /></svg>
        </div>
        <h2 className="font-display text-3xl font-normal text-ink">Assessment needed for coaching</h2>
        <p className="text-slate max-w-md">
          To receive personalized suggestions from the AI Sustainability Coach, please take the carbon assessment first.
        </p>
        <a
          href="/assess"
          className="rounded-md bg-primary text-on-primary px-6 py-3 font-semibold hover:bg-primary-deep transition-colors"
        >
          Start Assessment
        </a>
      </div>
    );
  }

  const { score, totalCO2, breakdown, formData } = results;

  // Find the highest emissions category
  const highestCategory = Object.keys(breakdown).reduce((a, b) => breakdown[a] > breakdown[b] ? a : b);
  const highestVal = breakdown[highestCategory];
  const highestPct = Math.round((highestVal / totalCO2) * 100);

  // Generate 3 custom suggestions
  const getCustomRecommendations = () => {
    const recs = [];
    
    // Recommendation 1: Highest category
    if (highestCategory === 'transport') {
      const carText = formData.carType === 'gas'
        ? `Upgrading your gasoline vehicle to an EV based on your weekly driving of ${formData.carMiles} miles can save around 1,100 kg CO₂ annually.`
        : `Since you drive ${formData.carMiles} miles weekly, replacing two trips with transit could save 150 kg CO₂/year.`;
      recs.push({
        title: 'Optimize Transport (Highest Impact)',
        desc: carText,
        impact: 'High',
        reduction: '400 - 1,100 kg CO₂e',
      });
    } else if (highestCategory === 'energy') {
      recs.push({
        title: 'Optimize Home Energy (Highest Impact)',
        desc: `Reducing daily AC usage by 2 hours and setting Eco-settings on your appliances can save up to 300 kg CO₂/year.`,
        impact: 'High',
        reduction: '250 - 350 kg CO₂e',
      });
    } else if (highestCategory === 'food') {
      const foodText = formData.dietType === 'nonVeg'
        ? "Transitioning from a meat-heavy diet to a mixed or vegetarian diet can cut your carbon impact by 1,000 kg CO₂ annually."
        : "Boosting your local organic groceries from 30% to 60% can save about 120 kg CO₂ annually.";
      recs.push({
        title: 'Adjust Diet (Highest Impact)',
        desc: foodText,
        impact: 'High',
        reduction: '300 - 1,000 kg CO₂e',
      });
    } else {
      recs.push({
        title: 'Conscious Sourcing (Highest Impact)',
        desc: `Your shopping habits ($${formData.clothingSpend + formData.electronicsSpend + formData.consumerGoodsSpend}/mo) are significant. Buying secondhand and extending device lifespans saves 300 kg CO₂.`,
        impact: 'High',
        reduction: '200 - 400 kg CO₂e',
      });
    }

    // Recommendation 2: Energy or food
    if (highestCategory !== 'energy') {
      recs.push({
        title: 'Smart Thermostat Settings',
        desc: `Lower heating or increase cooling points in your home, and unplug devices to save 120 kg CO₂ annually.`,
        impact: 'Medium',
        reduction: '120 kg CO₂e',
      });
    } else {
      recs.push({
        title: 'Dietary Adjustments',
        desc: `Reduce meat consumption: choosing poultry over beef or having 2 plant-based days cuts 250 kg CO₂/year.`,
        impact: 'Medium',
        reduction: '250 kg CO₂e',
      });
    }

    // Recommendation 3: Waste
    const wasteText = formData.recyclingHabit === 'none'
      ? "Establishing a consistent recycling habit for cans, cardboard, and plastics cuts waste emissions by 150 kg CO₂."
      : "Minimizing single-use packaging and segregating food compost saves 80 kg CO₂.";
    recs.push({
      title: 'Waste Reduction & Recycling',
      desc: wasteText,
      impact: 'Low',
      reduction: '80 - 150 kg CO₂e',
    });

    return recs;
  };

  const recommendations = getCustomRecommendations();

  // Local fallback response generator based on query keywords
  const generateLocalResponse = (query) => {
    const q = query.toLowerCase();
    
    if (q.includes('transport') || q.includes('car') || q.includes('drive') || q.includes('transit') || q.includes('flight')) {
      if (formData.carType === 'gas') {
        const val = formData.carMiles;
        const save = Math.round(val * 52 * 0.404 * 0.5);
        return `Your current vehicle is a gasoline car driven ${val} miles weekly. Since transportation is ${highestCategory === 'transport' ? 'your highest' : 'a major'} category (${highestPct}% of total emissions), I highly recommend replacing two weekly car commutes with public transit or carpooling, which would save approximately ${save} kg CO₂ annually. Transitioning to an Electric Vehicle (EV) would save about ${Math.round(val * 52 * (0.404 - 0.11))} kg CO₂ per year!`;
      }
      return `Since you ${formData.carType === 'electric' ? 'drive an EV' : 'do not own a car'}, your transport footprint is already optimized! For air travel, note that each flight hour adds 90 kg CO₂. Consider taking trains for short-distance regional trips.`;
    }

    if (q.includes('energy') || q.includes('electric') || q.includes('ac') || q.includes('appliance') || q.includes('utility')) {
      return `Your monthly electric bill is $${formData.electricBill} and you use Air Conditioning for ${formData.acHours} hours daily. To reduce this: 
      1. Turn off AC when not in the room. Setting AC to 78°F instead of 72°F saves 10% on energy.
      2. Switch appliances to Energy Star certified options (saving up to 150 kg CO₂/year).
      3. Unplug standby electronics to avoid 'phantom energy load'.`;
    }

    if (q.includes('food') || q.includes('diet') || q.includes('eat') || q.includes('meat') || q.includes('vegan') || q.includes('vegetarian')) {
      if (formData.dietType === 'nonVeg') {
        return `Your meat-heavy diet accounts for about 3,500 kg CO₂ per year. Transitioning to a Mixed diet or adopting a few plant-based days weekly (like Meatless Mondays) is one of the most effective actions you can take, saving over 400 kg CO₂ annually. Red meat (beef, lamb) has 5x the footprint of poultry or fish.`;
      }
      if (formData.dietType === 'vegetarian') {
        return `Your vegetarian diet is fantastic, producing about 1,500 kg CO₂/year! To optimize food footprint even further, focus on organic and local sourcing (currently at ${formData.organicRatio}%) to reduce agricultural shipping transit emissions.`;
      }
      return `With your mixed diet, food generates about 2,500 kg CO₂/year. Replacing beef or pork meals with vegetarian dishes twice per week will reduce your carbon footprint by 220 kg CO₂ annually.`;
    }

    if (q.includes('shop') || q.includes('buy') || q.includes('spending') || q.includes('clothing') || q.includes('electronics')) {
      return `Shopping accounts for ${breakdown.shopping} kg CO₂/year. To decrease this:
      1. Buy clothing secondhand or choose high-quality brands that last longer (fashion production is highly carbon-intensive).
      2. Keep electronic devices like laptops and smartphones for 4+ years instead of upgrading frequently. Manufacturing is 80% of an electronic's carbon cost.`;
    }

    if (q.includes('waste') || q.includes('recycle') || q.includes('plastic') || q.includes('segregate')) {
      return `Your waste management score is driven by single-use plastics (${formData.plasticUsage} usage) and recycling (${formData.recyclingHabit}). Upgrading to full recycling and minimizing plastics can save up to 250 kg CO₂/year. Keeping organic waste segregated from general garbage avoids landfill methane releases, saving 50 kg CO₂/year.`;
    }

    // General response
    return `Based on your footprint analysis:
    - Your total annual emissions are ${totalCO2.toLocaleString()} kg CO₂e (Score: ${score}/100).
    - Your highest emission category is ${categoryLabels[highestCategory]} (${highestPct}% of total).
    
    I recommend focusing on ${categoryLabels[highestCategory]} first. Ask me specifically about "how to reduce my ${highestCategory} emissions" for concrete action steps!`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = {
      sender: 'user',
      text: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // AI Response generation
    setTimeout(async () => {
      let responseText = '';
      
      // Try to use Google Gemini API if key is present
      const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY;
      if (apiKey) {
        try {
          const ai = new GoogleGenerativeAI(apiKey);
          const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt = `You are an expert AI Sustainability Coach. The user has a carbon score of ${score}/100 (annual emissions: ${totalCO2} kg CO2e).
          Their footprint breakdown: Transportation: ${breakdown.transport} kg, Home Energy: ${breakdown.energy} kg, Food: ${breakdown.food} kg, Shopping: ${breakdown.shopping} kg, Waste: ${breakdown.waste} kg.
          Their inputs: Vehicle: ${formData.carType} (${formData.carMiles} miles/week), public transit: ${formData.publicTransitMiles} miles/week, air travel: ${formData.flightHours} hours/year.
          Home electric bill: $${formData.electricBill}/month, AC hours: ${formData.acHours} hours/day.
          Diet: ${formData.dietType}, organic food: ${formData.organicRatio}%.
          Monthly shopping spends: Clothes: $${formData.clothingSpend}, Electronics: $${formData.electronicsSpend}, Goods: $${formData.consumerGoodsSpend}.
          Waste recycling: ${formData.recyclingHabit}, single-use plastics: ${formData.plasticUsage}.
          
          User asks: "${userMsg.text}". Provide a brief, supportive, and highly quantitative response, outlining carbon reductions.`;
          
          const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
          responseText = result.response.text;
        } catch (err) {
          console.error("Gemini API call failed, falling back to local engine.", err);
          responseText = generateLocalResponse(userMsg.text);
        }
      } else {
        // Fallback to local rule engine
        responseText = generateLocalResponse(userMsg.text);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
      setIsTyping(false);
    }, 1200); // Simulate network latency
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left side: Conversation Panel */}
      <div className="lg:col-span-7 rounded-lg border border-hairline-soft bg-canvas shadow-sm flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-hairline-soft flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-cream border border-beige-deep flex items-center justify-center text-primary">
              <Bot className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-sm">Gemini AI Coach</h3>
              <span className="text-[10px] text-green-600 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Online & Ready
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate bg-surface px-2.5 py-1 rounded border border-hairline-soft">
            Score: {score}/100
          </span>
        </div>

        {/* Chat Messages Panel */}
        <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg, index) => {
            const isCoach = msg.sender === 'coach';
            return (
              <div 
                key={index}
                className={`flex flex-col max-w-[80%] ${
                  isCoach ? 'self-start items-start' : 'self-end items-end'
                }`}
              >
                <div 
                  className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    isCoach 
                      ? 'bg-cream-light text-ink border border-beige-deep rounded-tl-none' 
                      : 'bg-primary text-on-primary rounded-tr-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          {isTyping && (
            <div className="self-start flex flex-col items-start max-w-[80%]">
              <div className="rounded-lg px-4 py-3 bg-cream-light border border-beige-deep rounded-tl-none flex gap-1 items-center">
                <span className="size-2 rounded-full bg-primary animate-bounce"></span>
                <span className="size-2 rounded-full bg-primary animate-bounce delay-150"></span>
                <span className="size-2 rounded-full bg-primary animate-bounce delay-300"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-hairline-soft bg-surface flex gap-3">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask about reducing transport, energy, food diet, shopping, or waste..."
            className="flex-grow h-11"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="rounded-md bg-primary text-on-primary px-5 py-2.5 font-semibold hover:bg-primary-deep active:bg-primary-deep transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      {/* Right side: Prioritized Insights */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="rounded-lg border border-beige-deep bg-cream p-6 shadow-sm">
          <h3 className="font-sans text-lg font-semibold text-ink border-b border-beige-deep pb-3 mb-4">
            AI Priority Recommendations
          </h3>
          
          <div className="flex flex-col gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="rounded-md bg-canvas border border-beige-deep p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    rec.impact === 'High' 
                      ? 'bg-red-100 text-red-700' 
                      : rec.impact === 'Medium' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-green-100 text-green-700'
                  }`}>
                    {rec.impact} Impact
                  </span>
                  <span className="text-xs font-bold text-primary">
                    Est. -{rec.reduction}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-ink">{rec.title}</h4>
                <p className="text-xs text-slate leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Summary card */}
        <div className="rounded-lg border border-hairline-soft bg-canvas p-6 shadow-sm flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone">
            Carbon Summary breakdown
          </h4>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs border-b border-hairline-soft pb-1.5">
              <span className="text-slate">Total CO₂ footprint:</span>
              <span className="font-semibold text-ink">{totalCO2.toLocaleString()} kg/year</span>
            </div>
            <div className="flex justify-between text-xs border-b border-hairline-soft pb-1.5">
              <span className="text-slate">Primary source:</span>
              <span className="font-semibold text-primary uppercase">{highestCategory} ({highestPct}%)</span>
            </div>
            <div className="flex justify-between text-xs pb-1">
              <span className="text-slate">Carbon Score:</span>
              <span className="font-semibold text-ink">{score}/100</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
