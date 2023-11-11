import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import readline from "readline";

const inquirer = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

interface IJob {
  rank: number;
  title: string;
  company: string;
  deadline: string;
  apply: string;
}

const fetchJob = (url: any) => {
  const cvWriter = createObjectCsvWriter({
    path: "./users.csv",
    header: [
      { id: "index", title: "Index" },
      { id: "titles", title: "Title" },
      { id: "companies", title: "Company" },
      { id: "deadline", title: "Deadline" },
      { id: "apply", title: "Apply" },
    ],
  });
  const AxiosInstance = axios.create();
  AxiosInstance.get(url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const jobsRow = $("main > div");
      const jobs: IJob[] = [];
      jobsRow.each((i, elem) => {
        const title: string = $(elem).find(".job > .content > h4").text();
        const company: string = $(elem)
          .find(".card > .content > .company > a")
          .text();
        const deadline: string = $(elem)
          .find(".card > .actions > .deadline > .expiration")
          .text();
        const apply: any = $(elem)
          .find(".card > .actions > div > a:last")
          .attr("href");
        jobs.push({ rank: i + 1, title, company, deadline, apply });
      });
      console.log(
        "\nThe list has been successfully registered. Please consult your JSON and CSV files. Thank you !\n"
      );
      const jsonContent = JSON.stringify(jobs);
      cvWriter.writeRecords(jobs);
      fs.writeFile("./users.json", jsonContent, "utf8", (error) => {
        if (error) console.log(error);
      });
    })
    .catch(console.error);
};

inquirer.question(
  "Please specify your location: (cameroon, chad, france, etc): ",
  async (country: any) => {
    fetchJob(
      "https://untalent.org/jobs/in-anything/contract-all/" +
        country.split(" ").join("-")
    );
  }
);
