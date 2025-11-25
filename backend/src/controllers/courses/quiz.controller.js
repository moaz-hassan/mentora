import * as quizService from "../../services/courses/quiz.service.js";

export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id, req.user.id);
    let quizData={
      id:quiz.id,
      title:quiz.title,
      questions:[]
    };
    quiz.questions.forEach((question) => {
       quizData.questions.push({
        id: question.id,
        question: question.question,
        options: question.options,
       })
    });
    
    
    res.status(200).json({
      success: true,
      data: quizData,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.createQuiz(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.updateQuiz(req.params.id, req.body, req.user.id);

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const result = await quizService.deleteQuiz(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuizResult = async (req, res, next) => {
  try {
    const result = await quizService.submitQuizResult(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizResultsByStudent = async (req, res, next) => {
  try {
    const results = await quizService.getQuizResultsByStudent(
      req.params.studentId
    );

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizResultsByQuiz = async (req, res, next) => {
  try {
    const results = await quizService.getQuizResultsByQuiz(req.params.quizId);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
