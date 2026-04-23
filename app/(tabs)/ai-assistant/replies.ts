import { getSuggestedCategories, ScoredGuide } from '@/data/guideContent';

import { CATEGORY_LABELS } from './constants';
import { detectDanger } from './nlp';

export function getProfanityReply(): string {
  const replies = [
    `I understand you're frustrated, but I'm here to help. Could you tell me more about what's broken so I can find the right guide?`,
    `No worries — repairs can be stressful. Let's focus on fixing the problem. What are you dealing with?`,
    `I'm built to help with home repairs. Let's work together — what's the issue you're facing?`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

export function getGreetingReply(): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetings = [
    `${timeGreeting}! I'm **Kumpuni AI**, your home repair assistant. I can help you troubleshoot issues with plumbing, electrical, appliances, cars, and electronics. What are you dealing with today?`,
    `Hey there! Ready to help you fix things around the house. Whether it's a **leaky faucet**, a **car that won't start**, or a **phone that won't charge** — just describe what's happening and I'll find the right guide for you.`,
    `Hello! I'm here to make home repairs less stressful. Tell me about the problem you're facing, and I'll search through my repair guides to point you in the right direction.`,
    `Hi! Got a broken something at home? I'm Kumpuni AI — I help with plumbing, electrical, appliances, cars, and electronics. What's going on?`,
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export function getThanksReply(): string {
  const replies = [
    `You're very welcome! If you run into anything else, I'm right here.`,
    `Glad I could help! Don't hesitate to ask if you need more guidance.`,
    `Anytime! Hope the repair goes smoothly. Let me know how it turns out.`,
    `Happy to help! Feel free to come back anytime you need a hand.`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

export function getGoodbyeReply(): string {
  const replies = [
    `Take care! Good luck with the repair.`,
    `See you later! Hope everything works out.`,
    `Bye for now! Reach out anytime you need help around the home.`,
    `Goodbye! Hope your fix goes well. Chat again if you need anything!`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

export function getIdentityReply(): string {
  return `I'm **Kumpuni AI**, an intelligent repair assistant built into the Kumpuni app. I was developed by the Kumpuni team to help people troubleshoot and fix things around their home, car, and devices.\n\n**What I know:**\n- Plumbing, electrical, painting, and drywall repairs\n- Appliance troubleshooting (washers, fridges, ACs, microwaves)\n- Car basics (battery, tires, fluids, warning lights)\n- Electronics (phones, laptops, routers, charging issues)\n\n**What I don't do:**\n- Weather, news, jokes (well, maybe a small one 😉), or general chat\n- I focus on repairs and maintenance to give you the best, most accurate guidance possible.\n\nGot something broken? Describe it and I'll find the right guide for you!`;
}

export function getJokeReply(): string {
  const jokes = [
    `Why did the plumber break up with the electrician? There was no spark between them! ⚡💔`,
    `I told my wife she was drawing her eyebrows too high. She looked surprised. 🎨`,
    `Why don't scientists trust atoms? Because they make up everything! ⚛️`,
    `I have a joke about construction, but I'm still working on it. 🏗️`,
    `Why did the scarecrow win an award? Because he was outstanding in his field! 🌾`,
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  return `${joke}\n\nNow, back to fixing things! What can I help you repair today? 🔧`;
}

export function getOfftopicReply(): string {
  return `Hmm, that sounds like it might be outside my repair expertise! I'm **Kumpuni AI**, and I specialize in helping you fix things around the home, car, and devices.\n\nI can help with:\n• **Plumbing** — leaky faucets, clogged drains, toilet issues\n• **Electrical** — outlets, breakers, light fixtures\n• **Appliances** — washers, fridges, ACs, microwaves\n• **Car** — battery, tires, fluids, warning lights\n• **Electronics** — phones, laptops, routers, chargers\n\nIs there something broken or not working that I can help you troubleshoot?`;
}

export function getCapabilitiesReply(): string {
  return `I'm **Kumpuni AI**, your personal home repair assistant. Here's what I can do for you:\n\n**🔍 Troubleshoot problems** — Describe what's broken or acting weird, and I'll analyze your issue and find the most relevant repair guide.\n\n**📋 Step-by-step guides** — I have detailed instructions for plumbing, electrical work, appliances, car maintenance, and electronics.\n\n**⚠️ Safety first** — Every guide includes safety warnings and tells you when it's time to call a professional instead of DIY.\n\n**🧑‍🔧 Pro fixers** — If your issue is too complex or dangerous, I can connect you with a **local fixer** through the Fixers tab.\n\n**Quick tips:** Try asking "how do I fix a leaky faucet?" or "my car won't start" and I'll get straight to the answer!`;
}

export function getComplexFallbackReply(): string {
  return `This sounds like a more complex issue that might need hands-on expertise. While I can point you to general guides, I'd recommend **consulting with a professional fixer** for this one.\n\nYou can browse available fixers in the **Fixers** tab — they specialize in everything from plumbing and electrical to car repair and appliance service. They'll be able to assess your situation in person and give you a proper solution.\n\nIn the meantime, can you tell me more about the symptoms? Any sounds, smells, error lights, or recent changes?`;
}

export function getDeveloperReply(): string {
  return `I was developed by the **Kumpuni team** — a group of developers, designers, and home repair enthusiasts who wanted to make DIY repairs more accessible for everyone.\n\n**About Kumpuni:**\n- Built to help homeowners and renters fix common problems without calling expensive professionals for every little thing\n- Combines expert repair knowledge with an easy-to-use AI assistant\n- Also connects you with verified local **fixers** when DIY isn't enough\n\nThe team is constantly improving me with new guides, better matching, and smarter responses. If you have feedback, we'd love to hear it through the Settings page!`;
}

export function getEmergencyReply(): string {
  return `🚨 **This sounds like an emergency situation.**\n\nPlease prioritize your safety:\n\n1. **If there's fire, sparks, or gas smell** — evacuate immediately and call emergency services\n2. **If water is flooding** — turn off the main water valve if it's safe to reach\n3. **If electrical shock risk** — turn off the main breaker from a dry location\n\nI'm not equipped to handle real-time emergencies. Please contact:\n• Emergency services (911/112) for life-threatening situations\n• A licensed professional for urgent repairs\n• Your utility company for gas or major electrical issues\n\nOnce the immediate danger is resolved, I can help you understand what caused it and how to prevent it in the future.`;
}

export function getSymptomReply(): string {
  const replies = [
    `Thanks for describing the symptoms! That helps me narrow things down. Let me search for guides that match what you're experiencing.`,
    `Symptom descriptions are super helpful. Based on what you're describing, let me find the most relevant repair guide.`,
    `Got it — that symptom profile is useful. Let me analyze this and find matching guides for you.`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

export function getDiagnosisReply(query: string, guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `Based on your description, the most likely cause is related to **${top.title}**. Here's my best-matching guide to help you confirm and fix it:`;
  }
  return `To diagnose this properly, I'd need a bit more detail. Can you tell me:\n\n• When did the problem start?\n• Any recent changes or events?\n• Specific sounds, smells, or visual signs?\n• Is it consistent or intermittent?`;
}

export function getStepByStepReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `Here are the step-by-step instructions for **${top.title}**. Tap the guide card below to see the full detailed walkthrough with tools, safety notes, and estimated time:`;
  }
  return `I'd be happy to walk you through step-by-step! First, can you tell me what specific repair you're trying to do? For example: **leaky faucet**, **car not starting**, or **outlet not working**?`;
}

export function getQuickFixReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `Here's a quick, temporary fix for **${top.title}** to tide you over until you can do a proper repair. Tap the guide card below for the full instructions — look for the "Quick Fix" section at the top:`;
  }
  return `I can suggest temporary fixes if I know the exact issue. Can you describe what's happening in more detail? For example: **leaking from the base**, **won't turn on**, or **making noise**?`;
}

export function getToolsNeededReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top && (top as any).tools) {
    const tools = (top as any).tools as string[];
    return `For **${top.title}**, you'll typically need:\n\n${tools.map((t: string) => `• ${t}`).join('\n')}\n\nYou can find most of these at any hardware store. Tap the guide card below to see the full tool list and step-by-step instructions.`;
  }
  return `Tool requirements depend on the specific repair. Tell me what you're fixing and I'll list exactly what you need!`;
}

export function getDifficultyReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `For **${top.title}**, most people with basic tools and patience can handle this. The step-by-step guide breaks everything down clearly. If any step feels unsafe or unclear, that's when to call a pro. Tap the card below to see the full instructions!`;
  }
  return `Difficulty depends on the repair. Tell me what you're dealing with and I'll give you an honest assessment!`;
}

export function getTimeEstimateReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `**${top.title}** typically takes about **30–90 minutes** for most people. Simple issues can be under 30 min; unexpected complications might push it to 2+ hours. This assumes you have the right tools and don't run into unexpected issues. Tap the guide below for the full breakdown.`;
  }
  return `Time estimates vary by repair. What are you working on? I'll give you a realistic timeframe.`;
}

export function getCostEstimateReply(): string {
  return `Cost varies a lot depending on your location, parts quality, and whether you DIY or hire someone.\n\n**DIY range:** ₱200–₱2,000 (parts + tools)\n**Pro fixer:** ₱500–₱5,000 depending on complexity\n\nTap any guide card for a more specific estimate, or browse the **Fixers** tab to get a quote from a local pro.`;
}

export function getSafetyCheckReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top && top.safetyNotes) {
    return `For **${top.title}**, here are the key safety points:\n\n⚠️ ${top.safetyNotes}\n\nAlways follow these — safety first! Full details in the guide below:`;
  }
  return `I always include safety warnings in every guide. Most common hazards:\n\n• **Electrical** — turn off power at the breaker\n• **Water** — shut off the main valve first\n• **Chemicals** — wear gloves and ventilate\n\nTap any repair guide to see detailed safety notes for your specific issue.`;
}

export function getReplaceVsFixReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `That's a smart question! For **${top.title}**, here's the rule of thumb:\n\n**Repair if:** The part is expensive, the fix is simple, and the unit is under 5–7 years old.\n**Replace if:** Multiple parts are failing, repair costs >50% of replacement, or it's very old.\n\nTap the guide below to see the specific factors for your situation.`;
  }
  return `Generally: **repair** if it's a simple fix on a relatively new item. **Replace** if it's old, repair costs are high, or multiple things are failing. Tell me the specific item and I can give you a better answer!`;
}

export function getCompareReply(): string {
  return `To compare options, I need to know the two solutions you're considering. For example:\n\n• **DIY vs. hiring a pro**\n• **Patch vs. replace**\n• **Temporary fix vs. permanent repair**\n\nTell me what you're weighing and I'll break down the pros and cons!`;
}

export function getFollowUpReply(lastTopic: string | null): string {
  if (lastTopic) {
    return `Got it — following up on **${lastTopic}**. Let me search for more specific guidance on that.`;
  }
  return `Could you remind me what we were discussing? I want to make sure I give you the right follow-up advice.`;
}

export function getClarificationReply(): string {
  return `Sorry if that wasn't clear! Let me rephrase:\n\nI analyze your repair description, match it to our repair guides, and present the most relevant one as a card you can tap for full step-by-step instructions.\n\nThink of me as a smart repair book that finds the right page for you. What problem are you trying to solve?`;
}

export function getRephraseReply(): string {
  return `Got it — simpler version:\n\nTell me what's broken or acting weird → I find the best repair guide → you follow the steps. That's it!\n\nWhat are you dealing with right now?`;
}

export function getSummarizeReply(): string {
  return `**TL;DR:** Describe your problem → I find the right repair guide → you fix it. Need a pro? Use the **Fixers** tab.\n\nWhat do you need help with?`;
}

export function getFindPartsReply(): string {
  return `You can find repair parts at:\n\n• **Hardware stores** — Ace Hardware, True Value, Wilcon\n• **Online** — Lazada, Shopee (search by part number)\n• **Authorized service centers** — for brand-specific parts (Samsung, LG, etc.)\n• **Auto parts shops** — for car repairs\n\nTap any guide card and check the **Tools & Materials** section for exact part names and model numbers.`;
}

export function getBrandSpecificReply(): string {
  return `While I have general repair guides, brand-specific repairs often need exact part numbers and disassembly steps.\n\n**My guides cover:** Common issues across most brands\n**For exact brand fixes:** Check your manual or contact the brand service center\n\nDescribe the **symptoms** (not working, error code, noise) and I'll match you to the most relevant general guide.`;
}

export function getModelSpecificReply(): string {
  return `Model-specific repairs usually need exact schematics and part numbers. My guides cover the **most common issues** across similar models.\n\nTell me the **symptoms** you're seeing — not working, error lights, strange sounds, leaks — and I'll match you to the right troubleshooting guide.`;
}

export function getLocationHelpReply(): string {
  return `You can find trusted local repair pros in the **Fixers** tab of the app!\n\nBrowse by category:\n• Plumbing & Electrical\n• Appliances & HVAC\n• Car & Motorcycle\n• Electronics & Gadgets\n\nEach fixer has ratings, reviews, and estimated rates. You can message them directly through the app!`;
}

export function getPreventiveReply(): string {
  return `Prevention is the best repair! Here are universal tips:\n\n• **Plumbing** — Don't pour grease down drains; check for leaks monthly\n• **Electrical** — Don't overload outlets; replace frayed cords immediately\n• **Appliances** — Clean filters/coils regularly; don't ignore small noises\n• **Car** — Follow maintenance schedule; check fluids monthly\n• **Electronics** — Keep devices dry and ventilated; use surge protectors\n\nRegular maintenance prevents 80% of emergency repairs. What area do you want to maintain better?`;
}

export function getMultiIssueReply(): string {
  return `Sounds like you have multiple issues at once! Let me help you prioritize:\n\n1. **Safety first** — any gas leaks, sparks, or flooding? Handle those immediately.\n2. **Biggest impact** — which problem affects your daily life most?\n3. **Causation** — sometimes one fix solves multiple symptoms\n\nTell me each issue one at a time and I'll match you to the right guide for each. Which one is most urgent?`;
}

export function getConfidenceCheckReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `I'm about **${Math.round(top.score)}% confident** that **${top.title}** is the right match for your description.\n\nMy confidence comes from matching your keywords to the guide title, symptoms, and steps. If this doesn't feel right, describe the issue in more detail — sounds, smells, exact location, when it started — and I'll search again!`;
  }
  return `To be more confident, I need more details from you:\n\n• Exact location (kitchen faucet vs. bathroom faucet)\n• When did it start?\n• Any sounds, smells, or error messages?\n• Recent changes (new installation, storm, etc.)?\n\nThe more specific you are, the better I can match you!`;
}

export function getAlternativeSolutionReply(guides: ScoredGuide[]): string {
  if (guides.length > 1) {
    const alt = guides[1];
    return `Here's an alternative approach: **${alt.title}** might also fit your situation. Some issues have multiple possible causes. Tap the second guide card below to compare!`;
  }
  return `I only found one strong match for your description. If that doesn't feel right, try rephrasing with different keywords — or tell me more symptoms and I'll search again!`;
}

export function generateExpertReply(query: string, guides: ScoredGuide[]): string {
  const danger = detectDanger(query);
  if (danger.isDangerous && danger.warning) {
    return danger.warning;
  }

  const top = guides[0];
  const score = top?.score ?? 0;
  const title = top?.title ?? '';
  const lowerQ = query.toLowerCase();

  const uncertaintyWords = ['don\'t know', 'not sure', 'maybe', 'something', 'weird', 'strange', 'what is', 'why'];
  const isUncertain = uncertaintyWords.some((w) => lowerQ.includes(w));
  const isQuestion = lowerQ.includes('?') || /^(how|what|why|is|does|can|will)/.test(lowerQ);

  if (score >= 100) {
    if (isUncertain && isQuestion) {
      return `It sounds like you might be dealing with a **${title.toLowerCase()}** issue. Here's the guide that should help:`;
    }
    if (isQuestion) {
      return `Great question! Here's a guide on **${title.toLowerCase()}** that should answer that:`;
    }
    return `Based on what you're describing, it sounds like a **${title.toLowerCase()}** problem. Here's what I found:`;
  }

  if (score >= 50) {
    return `I'm fairly confident this guide on **${title.toLowerCase()}** is what you're looking for:`;
  }

  if (score >= 25) {
    return `This guide on **${title.toLowerCase()}** might be relevant. Take a look:`;
  }

  const suggestions = getSuggestedCategories(lowerQ);
  if (suggestions.length > 0) {
    const catNames = suggestions.map((c) => `**${CATEGORY_LABELS[c] || c}**`).join(', ');
    return `I see this might be about ${catNames}. Could you describe the symptoms more specifically? What exactly happens — any sounds, smells, or error signs?`;
  }

  return `I\'m not sure I have a guide for that. Could you tell me if it\'s related to **plumbing**, **electrical**, **appliances**, **car**, or **electronics**?`;
}

export function confidenceBadge(conf: 'high' | 'medium' | 'low') {
  switch (conf) {
    case 'high':
      return { label: 'Best match', color: '#10B981', bg: '#ECFDF5' };
    case 'medium':
      return { label: 'Likely match', color: '#F59E0B', bg: '#FFFBEB' };
    case 'low':
      return { label: 'Maybe helpful', color: '#6B7280', bg: '#F3F4F6' };
  }
}
