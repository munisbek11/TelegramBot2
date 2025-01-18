import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Student, StudentDocument } from "./database/schema/student.schema";
import { Model } from "mongoose";
import * as TelegramBot from "node-telegram-bot-api";

@Injectable()
export class BotService {
  private bot: TelegramBot;
  private teacherId: number = 5575836992;
  private activeSessions: { [chatId: number]: any } = {};
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>
  ) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_API, { polling: true });

    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const name = msg.from.first_name;

      if (chatId === this.teacherId) {
        this.bot.sendMessage(this.teacherId, `Ustoz na gap😄`);
      } else {
        const student = await this.studentModel.findOne({ chatId });

        if (student) {
          this.bot.sendMessage(
            chatId,
            `${name} siz allqachon ro'yhatdan o'tgansiz!`
          );
        } else {
          await this.studentModel.create({ chatId, name });
          this.bot.sendMessage(chatId, `Muvofiqqiyatli ro'yhatdan o'tdingiz!`);
          this.bot.sendMessage(this.teacherId, `Yangi foydalanuvchi: ${name}`);
        }
      }
    });

    this.bot.onText(/\/quiz/, (msg) => {
      const chatId = msg.chat.id;
      if (!this.activeSessions[chatId]) {
        this.startQuiz(chatId);
      } else {
        this.bot.sendMessage(
          chatId,
          "Siz hozirda testni bajarishingiz mumkin."
        );
      }
    });
  }

  private async startQuiz(chatId: number) {
    this.activeSessions[chatId] = {
      questionCount: 0,
      correctAnswers: 0,
      currentQuestion: null,
    };
    this.askQuestion(chatId);
  }

  private async askQuestion(chatId: number) {
    const { questionCount } = this.activeSessions[chatId];

    if (questionCount >= 10) {
      const { correctAnswers } = this.activeSessions[chatId];
      this.bot.sendMessage(
        chatId,
        `Test tugadi! Siz ${correctAnswers} ta savolga to'g'ri javob berdingiz.`
      );
      this.bot.sendMessage(
        chatId,
        "Yana testni boshlash uchun /quiz buyrug'ini yuboring."
      );
      delete this.activeSessions[chatId];
      return;
    }

    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const operator = this.getRandomOperator();
    let question: string;
    let correctAnswer: number;

    switch (operator) {
      case "+":
        question = `${num1} + ${num2} = ?`;
        correctAnswer = num1 + num2;
        break;
      case "-":
        question = `${num1} - ${num2} = ?`;
        correctAnswer = num1 - num2;
        break;
      case "*":
        question = `${num1} * ${num2} = ?`;
        correctAnswer = num1 * num2;
        break;
    }

    this.activeSessions[chatId].currentQuestion = correctAnswer;
    this.bot.sendMessage(chatId, `${questionCount + 1}-savol: ${question}`);
    this.activeSessions[chatId].questionCount += 1;

    this.bot.once("message", (msg) => {
      const userAnswer = parseFloat(msg.text);
      if (msg.chat.id === chatId) {
        this.checkAnswer(chatId, userAnswer);
      }
    });
  }

  private checkAnswer(chatId: number, answer: number) {
    const correctAnswer = this.activeSessions[chatId].currentQuestion;

    if (Math.abs(answer - correctAnswer) < 0.01) {
      this.bot.sendMessage(chatId, "To'g'ri!");
      this.activeSessions[chatId].correctAnswers += 1;
    } else {
      this.bot.sendMessage(chatId, `Xato! To\'g\'ri javob: ${correctAnswer}`);
    }

    this.askQuestion(chatId);
  }

  private getRandomOperator(): string {
    const operators = ["+", "-", "*"];
    const randomIndex = Math.floor(Math.random() * operators.length);
    return operators[randomIndex];
  }
}
