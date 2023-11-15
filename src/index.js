"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const csv_writer_1 = require("csv-writer");
const readline_1 = __importDefault(require("readline"));
const inquirer = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "abbasaliaboubakar@gmail.com",
        pass: "welfexgsiyhlqwqi",
    },
});
const fetchJob = (url) => {
    const cvWriter = (0, csv_writer_1.createObjectCsvWriter)({
        path: "./jobs.csv",
        header: [
            { id: "index", title: "Index" },
            { id: "titles", title: "Title" },
            { id: "companies", title: "Company" },
            { id: "deadline", title: "Deadline" },
            { id: "apply", title: "Apply" },
        ],
    });
    const AxiosInstance = axios_1.default.create();
    AxiosInstance.get(url)
        .then((response) => {
        const html = response.data;
        const $ = cheerio_1.default.load(html);
        const jobsRow = $("main > div");
        const jobs = [];
        jobsRow.each((i, elem) => {
            const title = $(elem).find(".job > .content > h4").text();
            const company = $(elem)
                .find(".card > .content > .company > a")
                .text();
            const deadline = $(elem)
                .find(".card > .actions > .deadline > .expiration")
                .text();
            const apply = $(elem)
                .find(".card > .actions > div > a:last")
                .attr("href");
            jobs.push({ rank: i + 1, title, company, deadline, apply });
        });
        console.log("\nThe list has been successfully registered. Please consult your JSON and CSV files. Thank you !\n");
        const jsonContent = JSON.stringify(jobs);
        cvWriter.writeRecords(jobs);
        fs_1.default.writeFile("./jobs.json", jsonContent, "utf8", (error) => {
            if (error)
                console.log(error);
        });
        inquirer.question("addresse: ", (address) => __awaiter(void 0, void 0, void 0, function* () {
            transporter.sendMail({
                from: "abbasaliaboubakar@gmail.com",
                to: address,
                subject: "Hello from Nodemailer!",
                text: "This is a test email sent with Nodemailer using ES6 syntax.",
            }, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                }
                else {
                    console.log("Email sent:", info.response);
                }
            });
        }));
    })
        .catch(console.error);
};
const handleMail = () => {
    inquirer.question("Please specify your location: (cameroon, chad, france, etc): ", (country) => __awaiter(void 0, void 0, void 0, function* () {
        fetchJob("https://untalent.org/jobs/in-anything/contract-all/" +
            country.split(" ").join("-"));
    }));
};
handleMail();
