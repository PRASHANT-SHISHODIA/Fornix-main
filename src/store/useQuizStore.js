import { create } from 'zustand';

const useQuizStore = create((set, get) => ({
  answers: [],

  // Add or update answer (no duplicates)
  saveAnswer: (questionId, selectedKey) =>
    set((state) => {
      const index = state.answers.findIndex(
        (item) => item.question_id === questionId
      );

      if (index !== -1) {
        const updatedAnswers = [...state.answers];
        updatedAnswers[index] = {
          question_id: questionId,
          selected_key: selectedKey,
        };
        return { answers: updatedAnswers };
      }

      return {
        answers: [
          ...state.answers,
          {
            question_id: questionId,
            selected_key: selectedKey,
          },
        ],
      };
    }),

  // Get saved answer for a question
  getAnswer: (questionId) =>
    get().answers.find(
      (item) => item.question_id === questionId
    ),

  // Clear all answers
  resetAnswers: () => set({ answers: [] }),
}));

export default useQuizStore;