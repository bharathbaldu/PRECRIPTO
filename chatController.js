import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI (kept available, but dataset matching takes priority)
let genAI = null
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

// Expanded medication dataset (rule-based matching)
// Fields: illness, medicationName, type, commonBrands, dosageAdult, notes
const BASIC_MEDICATIONS_DATASET = [
  ["Fever", "Paracetamol", "Antipyretic", "Tylenol, Crocin", "500 mg every 4–6 hrs", "Do not exceed 4g/day"],
  ["Fever", "Ibuprofen", "NSAID", "Advil, Brufen", "200–400 mg every 6–8 hrs", "Avoid on empty stomach"],
  ["Cold", "Cetirizine", "Antihistamine", "Zyrtec", "10 mg once daily", "May cause drowsiness"],
  ["Cold", "Chlorpheniramine", "Antihistamine", "Piriton", "4 mg every 4–6 hrs", "Older generation; sedative"],
  ["Cough (dry)", "Dextromethorphan", "Cough Suppressant", "Benadryl Dry Cough", "10–20 mg every 4–6 hrs", "Avoid in children <4 years"],
  ["Cough (wet)", "Guaifenesin", "Expectorant", "Mucinex", "200–400 mg every 4 hrs", "Drink plenty of fluids"],
  ["Flu", "Oseltamivir", "Antiviral", "Tamiflu", "75 mg twice daily (5 days)", "Prescription needed"],
  ["Headache", "Paracetamol", "Analgesic", "Tylenol, Panadol", "500 mg every 4–6 hrs", "Safe for most people"],
  ["Headache", "Ibuprofen", "NSAID", "Advil, Nurofen", "200–400 mg every 6–8 hrs", "Avoid in ulcers or kidney issues"],
  ["Nasal Congestion", "Oxymetazoline", "Nasal Decongestant", "Otrivin, Afrin", "2–3 drops/spray twice daily", "Use max 3 days to avoid rebound"],
  ["Diarrhea", "Loperamide", "Antidiarrheal", "Imodium", "2 mg after each loose stool", "Max 8 mg/day without prescription"],
  ["Diarrhea", "ORS", "Rehydration", "Electral", "As needed", "Replenish fluids and electrolytes"],
  ["Constipation", "Lactulose", "Laxative", "Duphalac", "10–20 ml daily", "May take 24–48 hrs to work"],
  ["Constipation", "Psyllium Husk", "Bulk-forming laxative", "Isabgol", "1–2 tsp with water", "Drink with plenty of water"],
  ["Allergies", "Loratadine", "Antihistamine", "Claritin", "10 mg once daily", "Non-drowsy formula"],
  ["Allergies", "Fexofenadine", "Antihistamine", "Allegra", "120–180 mg once daily", "Avoid fruit juices (interfere with absorption)"],
  ["Nausea", "Ondansetron", "Antiemetic", "Zofran", "4–8 mg every 8 hrs", "Effective for nausea from multiple causes"],
  ["Nausea", "Domperidone", "Prokinetic/Antiemetic", "Motilium", "10 mg 2–3 times daily", "Take before meals"],
  ["Acidity", "Ranitidine", "H2 Blocker", "Zantac", "150 mg twice daily", "Avoid long-term use"],
  ["Acidity", "Pantoprazole", "PPI", "Protonix", "40 mg once daily before meals", "Take on an empty stomach"],
  ["Muscle Pain", "Diclofenac", "NSAID", "Voveran", "50 mg twice daily", "Take with food; may cause stomach upset"],
  ["Muscle Pain", "Paracetamol", "Analgesic", "Tylenol", "500 mg every 4–6 hrs", "Mild pain relief without inflammation"],
  ["Sore Throat", "Chlorhexidine", "Antiseptic", "Hexidine Gargle", "Gargle 2–3 times daily", "Don't swallow"],
  ["Sore Throat", "Honey", "Natural remedy", "Any brand", "1–2 tsp 2–3 times daily", "Soothes throat naturally"],
  ["Pain Relief", "Aspirin", "Analgesic", "Disprin", "300–600 mg every 4–6 hrs", "Avoid in children; can cause stomach bleeding"],
  ["Pain Relief", "Mefenamic Acid", "NSAID", "Ponstan", "250–500 mg every 6–8 hrs", "Better for menstrual pain"],
  ["Insect Bites", "Calamine Lotion", "Antipruritic", "Any brand", "Apply as needed", "Cooling and soothing"],
  ["Burns", "Silver Sulfadiazine", "Antibacterial", "Burnol, Flamazine", "Apply thin layer twice daily", "Prevents infection"],
  ["Skin Rash", "Hydrocortisone", "Topical Steroid", "Cortisone", "Apply twice daily", "Use max 7 days; avoid on face"],
]

const illnessKeywords = [
  { key: "fever", illness: "Fever" },
  { key: "temperature", illness: "Fever" },
  { key: "cold", illness: "Cold" },
  { key: "congestion", illness: "Nasal Congestion" },
  { key: "cough", illness: "Cough" },
  { key: "flu", illness: "Flu" },
  { key: "headache", illness: "Headache" },
  { key: "diarrhea", illness: "Diarrhea" },
  { key: "loose motion", illness: "Diarrhea" },
  { key: "constipation", illness: "Constipation" },
  { key: "allergy", illness: "Allergies" },
  { key: "allergies", illness: "Allergies" },
  { key: "nausea", illness: "Nausea" },
  { key: "vomit", illness: "Nausea" },
  { key: "acidity", illness: "Acidity" },
  { key: "heartburn", illness: "Acidity" },
  { key: "muscle pain", illness: "Muscle Pain" },
  { key: "body ache", illness: "Muscle Pain" },
  { key: "sore throat", illness: "Sore Throat" },
  { key: "throat pain", illness: "Sore Throat" },
  { key: "pain relief", illness: "Pain Relief" },
  { key: "pain", illness: "Pain Relief" },
  { key: "insect bite", illness: "Insect Bites" },
  { key: "mosquito bite", illness: "Insect Bites" },
  { key: "burn", illness: "Burns" },
  { key: "skin rash", illness: "Skin Rash" },
  { key: "rash", illness: "Skin Rash" },
]

// Function to find medication suggestions from dataset
const findMedicationSuggestionsFromDataset = (userQuestion) => {
  const suggestions = []
  
  // Search through illness keywords
  for (const keywordObj of illnessKeywords) {
    if (userQuestion.includes(keywordObj.key)) {
      // Find medications for this illness
      const medications = BASIC_MEDICATIONS_DATASET.filter(med => med[0] === keywordObj.illness)
      
      medications.forEach(med => {
        suggestions.push({
          illness: med[0],
          medicationName: med[1],
          type: med[2],
          commonBrands: med[3],
          dosageAdult: med[4],
          notes: med[5]
        })
      })
    }
  }
  
  return suggestions
}

// Health screening questions
const HEALTH_SCREENING_QUESTIONS = [
  "Do you have any existing medical conditions (like diabetes, hypertension, heart disease)?",
  "Are you taking any regular medications currently?",
  "Do you have high blood pressure?",
  "Do you have high blood sugar/diabetes?",
  "Are you allergic to any medications?",
  "When did these symptoms start?",
  "How severe are your symptoms (mild, moderate, severe)?",
  "Have you tried any treatments already?"
]

// Health issue indicators - if user answers "yes" to serious conditions, recommend doctor
const SERIOUS_CONDITIONS = ["diabetes", "diabetic", "blood pressure", "bp", "hypertension", "heart", "cardiac", "medications", "allergic", "allergy"]

// Main chat function with health screening
export const chatWithAI = async (req, res) => {
  try {
    const { message, healthData } = req.body
    
    // Validate input
    if (!message || message.trim() === '') {
      return res.status(400).json({
        answer: "Please provide a valid question.",
        error: "Empty question provided"
      })
    }
    
    const userQuestion = message.trim().toLowerCase()
    
    // If user has pre-existing conditions or takes medications, recommend doctor immediately
    if (healthData) {
      const hasSeriousConditions = SERIOUS_CONDITIONS.some(condition => 
        healthData.toLowerCase().includes(condition)
      )
      
      if (hasSeriousConditions) {
        return res.json({
          answer: "Given your medical history and current conditions, I strongly recommend you **consult with a doctor** rather than self-medicate. Your existing health conditions require professional medical supervision.\n\nPlease book an appointment with a qualified healthcare professional to get proper diagnosis and treatment.",
          needsDoctor: true,
          medicationSuggestions: [],
          source: "health_screening"
        })
      }
    }
    
    // Search for medication suggestions in dataset
    const datasetSuggestions = findMedicationSuggestionsFromDataset(userQuestion)
    
    if (datasetSuggestions.length > 0) {
      // Get the matched illness for dynamic response
      const matchedIllness = illnessKeywords.find(keyword => 
        userQuestion.includes(keyword.key.toLowerCase())
      )
      
      const illnessName = matchedIllness ? matchedIllness.illness : datasetSuggestions[0].illness
      
      // Create structured response with health screening reminder
      const botResponse = `For ${illnessName}, here are some over-the-counter options:\n\n` +
        datasetSuggestions.map(med => 
          `**${med.medicationName}** (${med.type})\n` +
          `• Common brands: ${med.commonBrands}\n` +
          `• Dosage: ${med.dosageAdult}\n` +
          `• Notes: ${med.notes}\n`
        ).join('\n') +
        `\n⚠️ **Important:** Please follow package instructions and consult a doctor if symptoms persist or worsen.\n\n` +
        `💡 **Before taking any medication, please inform me if you have:**\n` +
        `• High blood pressure or diabetes\n` +
        `• Any existing medical conditions\n` +
        `• Regular medications you take\n` +
        `• Known drug allergies\n\n` +
        `If yes to any of these, I'll recommend you see a doctor immediately.`
      
      res.json({
        answer: botResponse,
        medicationSuggestions: datasetSuggestions,
        matchedIllness: illnessName,
        source: "dataset"
      })
    } else {
      // Fallback response for unmatched queries
      res.json({
        answer: "I understand you're looking for medical advice. For accurate diagnosis and treatment, please consult with a qualified healthcare professional. If you have specific symptoms, I can provide general information about common conditions.",
        medicationSuggestions: [],
        matchedIllness: null,
        source: "fallback"
      })
    }
    
  } catch (error) {
    console.error("❌ Chat Error:", error)
    res.status(500).json({
      answer: "I'm experiencing technical difficulties. Please try again later.",
      error: "Internal server error"
    })
  }
}

// AI Service health check
export const checkAIService = async (req, res) => {
  try {
    if (!genAI) {
      return res.json({
        status: "not_configured",
        message: "AI service not configured (no API key)",
        configured: false
      })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = "Say 'AI service is working' in exactly 10 words."
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    res.json({
      status: "available",
      message: "AI service is working properly",
      configured: true,
      model: "gemini-1.5-flash",
      testResponse: text.substring(0, 50) + "..."
    })

  } catch (error) {
    console.error("❌ AI Health Check Error:", error)
    res.status(500).json({
      status: "error",
      message: "AI service health check failed",
      configured: true,
      error: error.message
    })
  }
}

// Get chat history (placeholder for future implementation)
export const getChatHistory = async (req, res) => {
  try {
    // This would typically fetch from a database
    // For now, return empty array
    res.json({
      messages: [],
      message: "Chat history feature coming soon"
    })
  } catch (error) {
    console.error("❌ Chat History Error:", error)
    res.status(500).json({
      error: "Failed to fetch chat history",
      message: error.message
    })
  }
}