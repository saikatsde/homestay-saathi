// 8 Host-Guest Communication Scenarios tailored for Himalayan Tea Garden Homestays
import { ScenarioDefinition } from '../types';

export const scenarios: ScenarioDefinition[] = [
  {
    id: 'pricing',
    icon: 'Tag',
    nameKey: 'scenarioPricing',
    defaultName: 'Room Pricing & Rates',
    descriptionKey: 'Room rates, food inclusion, and discount inquiries',
    replies: {
      en: ({ homestayName, price }) =>
        `Namaste! Thank you for inquiring with ${homestayName}. Our room tariff is ₹${price} per night, which includes fresh tea-garden morning breakfast and organic home-cooked dinner. We would love to host you!`,
      ne: ({ homestayName, price }) =>
        `नमस्ते! ${homestayName} मा सोधपुछ गर्नुभएकोमा धन्यवाद। हाम्रो प्रति रातको दर ₹${price} हो, जसमा बिहानको ताजा चियाबारी चिया, खाजा र अर्गानिक घरेलु बेलुकीको खाना समावेश छ। यहाँलाई स्वागत छ!`,
      bn: ({ homestayName, price }) =>
        `নমস্কার! ${homestayName}-এ খোঁজ নেওয়ার জন্য ধন্যবাদ। আমাদের প্রতি রাতের ভাড়া ₹${price}, যার মধ্যে সকালের খাঁটি চা-বাগানের চা, নাস্তা ও সুস্বাদু ঘরের খাবার অন্তর্ভুক্ত। আপনার আসার অপেক্ষায় রইলাম!`,
      hi: ({ homestayName, price }) =>
        `नमस्ते! ${homestayName} में संपर्क करने के लिए धन्यवाद। हमारा प्रति रात का किराया ₹${price} है, जिसमें सुबह की ताज़ा चाय, नाश्ता और घरेलू जैविक भोजन शामिल है। आपका स्वागत है!`,
    },
    phrases: {
      en: "What is your room tariff and what is included?",
      ne: "कोठाको शुल्क कति हो र के-के समावेश छ?",
      bn: "রুমের ভাড়া কত এবং কী কী সুবিধা আছে?",
      hi: "कमरे का किराया कितना है और क्या सुविधाएं शामिल हैं?",
    },
  },
  {
    id: 'directions',
    icon: 'MapPin',
    nameKey: 'scenarioDirections',
    defaultName: 'How to Reach / Directions',
    descriptionKey: 'Shared jeeps, road conditions, and landmarks',
    replies: {
      en: ({ homestayName, location }) =>
        `Namaste! ${homestayName} is located in ${location}. You can take a shared or reserved jeep from Siliguri/NJP/Darjeeling town directly to our village. Let us know when you reach the main road stand, and we will come meet you to help with luggage!`,
      ne: ({ homestayName, location }) =>
        `नमस्ते! ${homestayName} ${location} मा अवस्थित छ। सिलीगुढी/एनजेपी वा दार्जिलिङ बजारबाट हाम्रो गाउँसम्म सिधै सेयर वा रिजर्भ जिप पाइन्छ। मुख्य सडक आइपुगेपछि हामीलाई फोन गर्नुहोला, हामी झोला लिन आउनेछौं!`,
      bn: ({ homestayName, location }) =>
        `নমস্কার! ${homestayName} ${location}-এ অবস্থিত। শিলিগুড়ি/NJP অথবা দার্জিলিং শহর থেকে সরাসরি আমাদের গ্রামের শেয়ার জিপ বা প্রাইভেট ট্যাক্সি পেয়ে যাবেন। মেন রোডে পৌঁছে জানালে আমরা এগিয়ে নিয়ে আসব!`,
      hi: ({ homestayName, location }) =>
        `नमस्ते! ${homestayName} ${location} में स्थित है। सिलीगुड़ी/NJP या दार्जिलिंग से हमारे गाँव के लिए शेयर या रिज़र्व जीप आसानी से मिल जाती है। मुख्य स्टैंड पहुँचकर बताएं, हम सहायता के लिए आ जाएंगे!`,
    },
    phrases: {
      en: "How do we reach your homestay from NJP or Darjeeling?",
      ne: "एनजेपी वा दार्जिलिङबाट यहाँ कसरी आइपुग्ने?",
      bn: "NJP বা দার্জিলিং থেকে আপনাদের হোমস্টে কীভাবে পৌঁছাব?",
      hi: "NJP या दार्जिलिंग से आपके होमस्टे कैसे पहुंचे?",
    },
  },
  {
    id: 'checkin',
    icon: 'Clock',
    nameKey: 'scenarioCheckin',
    defaultName: 'Check-in / Check-out Times',
    descriptionKey: 'Arrival timing, luggage drop, and early check-in',
    replies: {
      en: ({ homestayName }) =>
        `Namaste! Standard check-in at ${homestayName} is 12:00 PM and check-out is 11:00 AM. If you arrive early by morning jeep, you are welcome to rest, enjoy warm Darjeeling tea, and keep your bags while we prepare your room.`,
      ne: ({ homestayName }) =>
        `नमस्ते! ${homestayName} मा Check-in समय दिउँसो १२:०० बजे र Check-out बिहान ११:०० बजे हो। बिहान सबेरै आइपुग्नुभए पनि न्यानो चिया खाँदै आराम गर्न र झोला राख्न सक्नुहुन्छ।`,
      bn: ({ homestayName }) =>
        `নমস্কার! ${homestayName}-এ চেক-ইন সময় দুপুর ১২:০০ এবং চেক-আউট সকাল ১১:০০। সকালে তাড়াতাড়ি পৌঁছে গেলেও ব্যাগ রেখে বিশ্রাম ও তাজা দার্জিলিং চা উপভোগ করতে পারেন।`,
      hi: ({ homestayName }) =>
        `नमस्ते! ${homestayName} में चेक-इन समय दोपहर 12:00 बजे और चेक-आउट सुबह 11:00 बजे है। यदि आप सुबह जल्दी पहुँचते हैं, तो भी आराम से चाय पी सकते हैं और सामान रख सकते हैं।`,
    },
    phrases: {
      en: "What are your check-in and check-out timings?",
      ne: "Check-in र Check-out को समय कति बजे हो?",
      bn: "চেক-ইন ও চেক-আউট সময় কখন?",
      hi: "चेक-इन और चेक-आउट का समय क्या है?",
    },
  },
  {
    id: 'food',
    icon: 'Utensils',
    nameKey: 'scenarioFood',
    defaultName: 'Home-cooked Food & Chai',
    descriptionKey: 'Local organic vegetables, dietary requests, tea',
    replies: {
      en: ({ homestayName }) =>
        `Namaste! At ${homestayName}, we serve authentic, organic home-cooked meals prepared from our kitchen garden vegetables, local dal, hill potatoes, and homemade chutney. Vegetarian and non-vegetarian options are both available upon request!`,
      ne: ({ homestayName }) =>
        `नमस्ते! ${homestayName} मा हामी हाम्रै करेसाबारीको ताजा तरकारी, स्थानीय दाल र घरेलु अचारबाट बनेको शुद्ध अर्गानिक खाना खुवाउँछौं। शाकाहारी तथा मांसाहारी दुवै सुविधा छ।`,
      bn: ({ homestayName }) =>
        `নমস্কার! ${homestayName}-এ আমরা আমাদের নিজস্ব বাগানের খাঁটি জৈব শাকসবজি, পাহাড়ের আলু ও সুস্বাদু স্থানীয় খাবার পরিবেশন করি। নিরামিষ ও আমিষ উভয় খাবারের ব্যবস্থাই আছে।`,
      hi: ({ homestayName }) =>
        `नमस्ते! ${homestayName} में हम अपने बगीचे की ताज़ी जैविक सब्ज़ियों और स्थानीय पहाड़ी दाल-रोटी का शुद्ध भोजन परोसते हैं। शाकाहारी और मांसाहारी दोनों विकल्प उपलब्ध हैं!`,
    },
    phrases: {
      en: "What kind of food is served? Are meals included?",
      ne: "कस्तो खाना पाइन्छ र के यो दरमै समावेश छ?",
      bn: "কী ধরনের খাবার পরিবেশন করা হয়?",
      hi: "यहाँ किस प्रकार का भोजन मिलता है?",
    },
  },
  {
    id: 'teagarden',
    icon: 'Trees',
    nameKey: 'scenarioTeaGarden',
    defaultName: 'Tea Plucking & Village Walk',
    descriptionKey: 'Guided plantation walks, birdwatching, factory visit',
    replies: {
      en: ({ homestayName }) =>
        `Namaste! As part of staying with us at ${homestayName}, we will personally take you on a morning walk through the tea gardens, show you traditional tea-leaf plucking, and guide you to scenic sunrise viewpoints with Kanchenjunga views.`,
      ne: ({ homestayName }) =>
        `नमस्ते! ${homestayName} मा बस्दा हामी बिहान आफैं चियाबारी घुमाउने, चिया टिप्ने तरिका देखाउने र कञ्चनजङ्घा देखिने सुन्दर डाँडाहरूको यात्रा गराउनेछौं।`,
      bn: ({ homestayName }) =>
        `নমস্কার! ${homestayName}-এ থাকার সময় আমরা সকালে আপনাকে সাথে করে চা-বাগানে নিয়ে যাব, চা পাতা তোলার দৃশ্য দেখাব এবং কাঞ্চনজঙ্ঘার সুন্দর ভিউ পয়েন্টে ভ্রমণ করাব।`,
      hi: ({ homestayName }) =>
        `नमस्ते! ${homestayName} में ठहरने के दौरान हम आपको सुबह चाय बागान की सैर कराएंगे, चाय पत्ती चुनने की कला दिखाएंगे और कंचनजंगा के सुंदर नज़ारे वाले स्थानों पर ले जाएंगे।`,
    },
    phrases: {
      en: "Can we walk in the tea gardens and see local village life?",
      ne: "के चियाबारी घुम्न र गाउँको जनजीवन हेर्न पाइन्छ?",
      bn: "চা-বাগানে ঘোরা ও গ্রামের পরিবেশ দেখা যাবে কি?",
      hi: "क्या हम चाय बागानों में घूम सकते हैं?",
    },
  },
  {
    id: 'rules',
    icon: 'ShieldCheck',
    nameKey: 'scenarioRules',
    defaultName: 'House Rules & Quiet Hours',
    descriptionKey: 'Village quiet hours, smoking rules, peaceful stay',
    replies: {
      en: ({ homestayName }) =>
        `Namaste! We welcome you to ${homestayName} as our family. Our village observes quiet hours after 9:30 PM to respect nature and neighbors. Smoking is permitted only in outdoor open garden areas.`,
      ne: ({ homestayName }) =>
        `नमस्ते! ${homestayName} मा परिवारकै सदस्यको रूपमा स्वागत छ। गाउँको शान्ति कायम राख्न राति ९:३० पछि हल्ला नगर्न अनुरोध गर्दछौं। धुम्रपान बाहिरी बगैंचामा मात्र गर्न पाइन्छ।`,
      bn: ({ homestayName }) =>
        `নমস্কার! ${homestayName}-এ আপনাকে পারিবারিক পরিবেশে স্বাগতম। পাহাড় ও গ্রামের শান্তির স্বার্থে রাত ৯:৩০ এর পর উচ্চশব্দ পরিহার করতে অনুরোধ করি। ধূমপান কেবল বাইরের বাগানে অনুমোদিত।`,
      hi: ({ homestayName }) =>
        `नमस्ते! ${homestayName} में आपका पारिवारिक माहौल में स्वागत है। गाँव की शांति बनाए रखने के लिए रात 9:30 बजे के बाद शांति बनाए रखें। धूम्रपान केवल खुले बगीचे में अनुमत है।`,
    },
    phrases: {
      en: "What are your homestay rules regarding quiet hours and smoking?",
      ne: "शान्त रहने समय र नियमहरू के-के छन्?",
      bn: "হোমস্টে-র নিয়মকানুন কী কী?",
      hi: "होमस्टे के क्या नियम और समय सीमाएं हैं?",
    },
  },
  {
    id: 'weather',
    icon: 'ThermometerSnowflake',
    nameKey: 'scenarioWeather',
    defaultName: 'Hill Weather & Hot Water',
    descriptionKey: 'Temperature, woolens advice, 24/7 hot bucket water',
    replies: {
      en: ({ homestayName }) =>
        `Namaste! Evenings in our hills get chilly, so we recommend carrying a warm jacket or sweater. At ${homestayName}, we provide fresh hot water for bathing and cozy Himalayan fleece blankets for a comfortable sleep!`,
      ne: ({ homestayName }) =>
        `नमस्ते! पहाडमा साँझ-बिहान चिसो हुने भएकाले न्यानो ज्याकेट वा स्विटर ल्याउनुहोला। ${homestayName} मा नुहाउन तातो पानी र सुत्न बाक्लो न्यानो सिरकको पूर्ण व्यवस्था छ!`,
      bn: ({ homestayName }) =>
        `নমস্কার! পাহাড়ে সকাল ও সন্ধ্যায় বেশ ঠান্ডা থাকে, তাই পর্যাপ্ত গরম জামাকাপড় সাথে রাখবেন। ${homestayName}-এ স্নানের জন্য গরম জল ও আরামদায়ক লেপ-কম্বলের ব্যবস্থা রয়েছে!`,
      hi: ({ homestayName }) =>
        `नमस्ते! पहाड़ों में शाम और सुबह ठंड रहती है, इसलिए गर्म कपड़े ज़रूर लाएं। ${homestayName} में नहाने के लिए गर्म पानी और सोने के लिए आरामदायक रजाई-कंबलों की पूरी व्यवस्था है!`,
    },
    phrases: {
      en: "Is it very cold right now? Is hot water available?",
      ne: "अहिले धेरै चिसो छ? के तातो पानीको व्यवस्था छ?",
      bn: "এখন কি খুব ঠান্ডা? গরম জলের ব্যবস্থা আছে কি?",
      hi: "क्या अभी बहुत ठंड है? क्या गर्म पानी की सुविधा है?",
    },
  },
  {
    id: 'upi',
    icon: 'CreditCard',
    nameKey: 'scenarioUPI',
    defaultName: 'Cash & UPI Payment Info',
    descriptionKey: 'Cash preference in hill zones, GPay / PhonePe info',
    replies: {
      en: ({ homestayName }) =>
        `Namaste! We accept payments via GPay/PhonePe UPI or Cash. Since mobile network in hill pockets can fluctuate sometimes, keeping some cash handy is always recommended when traveling in Darjeeling villages.`,
      ne: ({ homestayName }) =>
        `नमस्ते! हामी GPay/PhonePe वा नगद भुक्तानी दुवै स्वीकार गर्दछौं। पहाडी क्षेत्रमा कहिलेकाहीं नेटवर्क कमजोर हुन सक्ने भएकाले केही नगद साथमा राख्नु उचित हुन्छ।`,
      bn: ({ homestayName }) =>
        `নমস্কার! আমরা Google Pay, PhonePe UPI বা সরাসরি নগদ অর্থ গ্রহণ করি। পাহাড়ি এলাকায় মাঝে মাঝে নেটওয়ার্ক সমস্যা হতে পারে, তাই কিছু নগদ টাকা সাথে রাখা ভালো।`,
      hi: ({ homestayName }) =>
        `नमस्ते! हम GPay/PhonePe UPI और नकद दोनों भुगतान स्वीकार करते हैं। पहाड़ी इलाकों में कभी-कभी नेटवर्क समस्या हो सकती है, इसलिए थोड़ी नकदी साथ रखना सुविधाजनक रहेगा।`,
    },
    phrases: {
      en: "Can I pay via Google Pay / UPI or is cash required?",
      ne: "के UPI/GPay बाट तिर्न मिल्छ कि नगद नै चाहिन्छ?",
      bn: "UPI বা Google Pay-তে পেমেন্ট করা যাবে কি?",
      hi: "क्या UPI/GPay से भुगतान किया जा सकता है?",
    },
  },
];
