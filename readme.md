# WABot 🤖

Hey there! This is my WhatsApp bot built with Node.js, kinda made with a little help from AI 😼✨  
I experiment, break stuff, fix it… all in the name of learning & fun!  

## Features
- Group Management (Anti-spam, Kick, URL Whitelist, Banned Words)
- Special Text (Auto-reply when keywords are triggered "Configurable for DM, Group or Both")

## Setup
1. Install Node.js & Git
2. Clone this repo:  
   ```bash
   git clone https://github.com/idlenyanko/WABot.git
   ```
3. Install dependencies:  
   ```bash
   npm install
   ```
4. Run the bot:  
   ```bash
   node index.js
   ```

## First Run
Generate a license using `generate_key.js`.
```bash
node generate_key <your_number> <days>
```

Example:
```bash
node generate_key 6281xxx 10 
```
The bot will run for 10 days using the scanned WhatsApp number.

If `gembok.env` is missing, generate it using `generate_gembok.js`.
This file only contains SpecialText used to encrypt `masterkey.enc`.

## Contributing
Feel free to fork, tweak, or just have fun exploring the code 😸✨  

## License
MIT License
