import { useCallback, useState } from 'react';

import { findBestGuides, ScoredGuide } from '@/data/guideContent';

import { SYNONYM_MAP } from './constants';
import { detectDanger, detectIntent, extractEntities } from './nlp';
import {
  generateExpertReply,
  getAlternativeSolutionReply,
  getBrandSpecificReply,
  getCapabilitiesReply,
  getClarificationReply,
  getCompareReply,
  getComplexFallbackReply,
  getConfidenceCheckReply,
  getCostEstimateReply,
  getDeveloperReply,
  getDiagnosisReply,
  getDifficultyReply,
  getEmergencyReply,
  getFindPartsReply,
  getFollowUpReply,
  getGoodbyeReply,
  getGreetingReply,
  getIdentityReply,
  getJokeReply,
  getLocationHelpReply,
  getModelSpecificReply,
  getMultiIssueReply,
  getOfftopicReply,
  getPreventiveReply,
  getProfanityReply,
  getQuickFixReply,
  getRephraseReply,
  getReplaceVsFixReply,
  getSafetyCheckReply,
  getStepByStepReply,
  getSummarizeReply,
  getSymptomReply,
  getThanksReply,
  getTimeEstimateReply,
  getToolsNeededReply,
} from './replies';
import { Message } from './types';
import { uid } from './uid';

type UseAIAssistantOptions = {
  scrollToBottom: () => void;
};

export function useAIAssistant({ scrollToBottom }: UseAIAssistantOptions) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingIds, setTypingIds] = useState<Set<string>>(new Set());
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [, setLastCategory] = useState<string | null>(null);

  const runExpertQuery = useCallback((query: string, idPrefix = '') => {
    const thinkId = uid('think-');
    const aiId = uid(idPrefix);

    setTypingIds((prev) => new Set(prev).add(thinkId));
    scrollToBottom();

    setTimeout(() => {
      const { intent } = detectIntent(query);

      let reply = '';
      let guides: ScoredGuide[] | undefined;

      switch (intent) {
        case 'greeting':
          reply = getGreetingReply();
          break;
        case 'thanks':
          reply = getThanksReply();
          break;
        case 'goodbye':
          reply = getGoodbyeReply();
          break;
        case 'capabilities':
          reply = getCapabilitiesReply();
          break;
        case 'identity':
          reply = getIdentityReply();
          break;
        case 'developer':
          reply = getDeveloperReply();
          break;
        case 'joke':
          reply = getJokeReply();
          break;
        case 'offtopic':
          reply = getOfftopicReply();
          break;
        case 'profanity':
          reply = getProfanityReply();
          break;
        case 'emergency':
          reply = getEmergencyReply();
          break;
        case 'symptom_describe':
          reply = getSymptomReply();
          break;
        case 'diagnosis': {
          const results = findBestGuides(query, 3);
          reply = getDiagnosisReply(query, results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'step_by_step': {
          const results = findBestGuides(query, 3);
          reply = getStepByStepReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'quick_fix': {
          const results = findBestGuides(query, 3);
          reply = getQuickFixReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'tools_needed': {
          const results = findBestGuides(query, 3);
          reply = getToolsNeededReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'difficulty': {
          const results = findBestGuides(query, 3);
          reply = getDifficultyReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'time_estimate': {
          const results = findBestGuides(query, 3);
          reply = getTimeEstimateReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'cost_estimate':
          reply = getCostEstimateReply();
          break;
        case 'safety_check': {
          const results = findBestGuides(query, 3);
          reply = getSafetyCheckReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'replace_vs_fix': {
          const results = findBestGuides(query, 3);
          reply = getReplaceVsFixReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'compare_solutions':
          reply = getCompareReply();
          break;
        case 'follow_up':
          reply = getFollowUpReply(lastTopic);
          break;
        case 'clarification':
          reply = getClarificationReply();
          break;
        case 'rephrase':
          reply = getRephraseReply();
          break;
        case 'summarize':
          reply = getSummarizeReply();
          break;
        case 'find_parts':
          reply = getFindPartsReply();
          break;
        case 'brand_specific':
          reply = getBrandSpecificReply();
          break;
        case 'model_specific':
          reply = getModelSpecificReply();
          break;
        case 'location_help':
          reply = getLocationHelpReply();
          break;
        case 'preventive':
          reply = getPreventiveReply();
          break;
        case 'multi_issue':
          reply = getMultiIssueReply();
          break;
        case 'confidence_check': {
          const results = findBestGuides(query, 3);
          reply = getConfidenceCheckReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'alternative_solution': {
          const results = findBestGuides(query, 3);
          reply = getAlternativeSolutionReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'expert':
        default: {
          const entities = extractEntities(query);
          const danger = detectDanger(query);

          if (danger.isDangerous && danger.warning) {
            reply = danger.warning;
            break;
          }

          let expandedQuery = query;
          const qLower = query.toLowerCase();
          for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
            if (qLower.includes(key)) {
              expandedQuery += ' ' + synonyms.join(' ');
            }
          }

          const results = findBestGuides(expandedQuery, 3);

          if (results.length === 0 && query.length > 40) {
            reply = getComplexFallbackReply();
          } else {
            reply = generateExpertReply(query, results);
            guides = results.length > 0 ? results : undefined;
          }

          if (guides && guides.length > 0) {
            setLastTopic(guides[0].title);
            if (entities.category) setLastCategory(entities.category);
          }
          break;
        }
      }

      setTypingIds((prev) => {
        const next = new Set(prev);
        next.delete(thinkId);
        next.add(aiId);
        return next;
      });

      const aiMsg: Message = {
        id: aiId,
        role: 'ai',
        text: reply,
        guides,
      };

      setMessages((prev) => [...prev, aiMsg]);
      scrollToBottom();

      setTimeout(() => {
        setTypingIds((prev) => {
          const next = new Set(prev);
          next.delete(aiId);
          return next;
        });
      }, reply.length * 18 + 200);
    }, 900 + Math.random() * 600);
  }, [lastTopic, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const text = input.trim();
    const userMsg: Message = { id: uid('user-'), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    runExpertQuery(text);
  }, [input, runExpertQuery]);

  const handleChip = useCallback((text: string) => {
    const userMsg: Message = { id: uid('user-'), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    runExpertQuery(text, 'chip-');
  }, [runExpertQuery]);

  const handleSuggestion = useCallback((text: string) => {
    const userMsg: Message = { id: uid('user-'), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    runExpertQuery(text, 'suggest-');
  }, [runExpertQuery]);

  const handleReset = useCallback(() => {
    setMessages([]);
    setTypingIds(new Set());
    setLastTopic(null);
    setLastCategory(null);
    setInput('');
  }, []);

  const initializeFromPhoto = useCallback((photoUri: string) => {
    if (!photoUri) return;

    setMessages([
      {
        id: uid('photo-user-'),
        role: 'user',
        text: 'I took a photo of the issue. Can you help?',
        photoUri,
      },
    ]);
    runExpertQuery('leak from photo', 'photo-');
  }, [runExpertQuery]);

  return {
    input,
    setInput,
    messages,
    typingIds,
    handleSend,
    handleChip,
    handleSuggestion,
    handleReset,
    initializeFromPhoto,
  };
}
