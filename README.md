
# Whatsapp Chatgpt

WhatsApp ChatGPT is a conversational AI application designed to enhance your messaging experience on WhatsApp. By integrating the power of OpenAI's GPT (Generative Pre-trained Transformer) model directly into your WhatsApp conversations, this application provides intelligent and contextually relevant responses to your messages

## Installation

1. Make sure you have Node.js and npm installed on your computer.
2. Clone this repository to your local directory.
3. Open a terminal and navigate to the project directory.
4. Run the following command to install all dependencies:

`npm install`

## Configuration

1. Create a .env file in your project directory.
2. Copy the contents of the .env.example file into the .env file.
3. Fill in the required environment variables, including the database URL and OpenAI API key.

## Prisma Setup

1. To set up Prisma, run the command:

`npx prisma init`

2. Follow the steps in the initialization process to configure Prisma.
3. After Prisma is initialized, run the following command to create a migration:

`npx prisma migrate dev --name <migration-name>`

Replace <migration-name> with a relevant name for your migration.

## Running the Project

Once installation, configuration, and migration are completed, you can run the project by executing:

`npm start`

## Thank You

