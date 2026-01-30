/* eslint-disable */
const https = require('https');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const tasks = require('../jira_tasks.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log("--- Jira Task Uploader ---");
    console.log("This script will upload tasks from jira_tasks.json to your Jira project.");
    console.log("NOTE: You need an API Token, not your password. Generate one here: https://id.atlassian.com/manage-profile/security/api-tokens\n");

    const domain = await ask("Jira Domain (e.g. 'mycompany' for mycompany.atlassian.net): ");
    const email = await ask("Jira Email: ");
    const apiToken = await ask("Jira API Token: ");
    const projectKey = await ask("Target Project Key (e.g. PRJ): ");

    if (!domain || !email || !apiToken || !projectKey) {
        console.error("All fields are required.");
        process.exit(1);
    }

    const cleanDomain = domain.replace('.atlassian.net', '');
    const baseUrl = `https://${cleanDomain}.atlassian.net/rest/api/3/issue`;

    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const headers = {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const createIssue = (data) => {
        return new Promise((resolve, reject) => {
            const req = https.request(baseUrl, {
                method: 'POST',
                headers: headers
            }, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(body));
                    } else {
                        console.error(`Error: ${res.statusCode} ${body}`);
                        reject({ statusCode: res.statusCode, body: body });
                    }
                });
            });

            req.on('error', (e) => reject(e));
            req.write(JSON.stringify(data));
            req.end();
        });
    };

    try {
        for (const story of tasks) {
            console.log(`Creating Story: ${story.summary}...`);

            const storyPayload = {
                fields: {
                    project: { key: projectKey },
                    summary: story.summary,
                    description: {
                        version: 1,
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [{ type: "text", text: story.description }]
                            }
                        ]
                    },
                    issuetype: { name: "Story" }
                }
            };

            try {
                const storyResult = await createIssue(storyPayload);
                console.log(`✅ Created Story: ${storyResult.key}`);

                if (story.subtasks && story.subtasks.length > 0) {
                    for (const sub of story.subtasks) {
                        console.log(`  Creating Subtask: ${sub.summary}...`);
                        const subPayload = {
                            fields: {
                                project: { key: projectKey },
                                parent: { key: storyResult.key },
                                summary: sub.summary,
                                description: {
                                    version: 1,
                                    type: "doc",
                                    content: [
                                        {
                                            type: "paragraph",
                                            content: [{ type: "text", text: sub.description }]
                                        }
                                    ]
                                },
                                issuetype: { name: "Sub-task" }
                            }
                        };
                        const subResult = await createIssue(subPayload);
                        console.log(`  ✅ Created Subtask: ${subResult.key}`);
                    }
                }
            } catch (err) {
                // Skip and continue
            }
        }

        console.log("\nAll done!");
    } catch (error) {
        console.error("Unexpected error:", error);
    } finally {
        rl.close();
    }
}

main();
