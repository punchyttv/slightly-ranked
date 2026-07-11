SLIGHTLY RANKED - READY FILE

This is the finished starter project using the rank images you uploaded.
It has:
- Rank-up overlay
- XP progression from Bronze I to SSL
- Saves viewer XP in data/viewers.json
- Leaderboard
- TikFinity webhook URLs
- TikTok LIVE Studio Link Source support after free hosting

IMPORTANT:
TikTok LIVE Studio usually rejects localhost links.
Use localhost only for testing. For your real stream, host it free on Render so you get an HTTPS link.

--------------------------------
LOCAL TEST ON WINDOWS 10
--------------------------------
1. Install Node.js from nodejs.org if needed.
2. Unzip this folder.
3. Double-click START-WINDOWS.bat.
4. Wait until it says Slightly Ranked is running.
5. Open:
   http://localhost:3000
6. Click Open Overlay.
7. Use the test buttons to trigger rank-up animations.

--------------------------------
TIKTOK LIVE STUDIO
--------------------------------
After you host it on Render, add this as a Link Source:

https://YOUR-RENDER-APP.onrender.com/overlay

Do NOT use localhost in TikTok LIVE Studio.

--------------------------------
FREE HOSTING WITH RENDER
--------------------------------
1. Make a free GitHub account if you do not have one.
2. Create a new GitHub repo.
3. Upload this entire folder to the repo.
4. Go to render.com and make a free account.
5. Click New +
6. Click Web Service.
7. Connect your GitHub repo.
8. Settings:
   Build Command: npm install
   Start Command: npm start
   Plan: Free
9. Deploy.
10. Render gives you a link like:
    https://slightly-ranked.onrender.com
11. Your overlay link is:
    https://slightly-ranked.onrender.com/overlay

--------------------------------
TIKFINITY WEB REQUEST URLS
--------------------------------
In TikFinity, create an event and add a Web Request action.
Use these URLs after hosting:

Follow:
https://YOUR-RENDER-APP.onrender.com/event/follow?user={username}

Chat:
https://YOUR-RENDER-APP.onrender.com/event/chat?user={username}

Share:
https://YOUR-RENDER-APP.onrender.com/event/share?user={username}

Rose:
https://YOUR-RENDER-APP.onrender.com/event/rose?user={username}

Gift:
https://YOUR-RENDER-APP.onrender.com/event/gift?user={username}&xp=100

Big gift example:
https://YOUR-RENDER-APP.onrender.com/event/gift?user={username}&xp=500

If TikFinity uses a different username variable, replace {username} with whatever TikFinity shows in its variable list.

--------------------------------
EDIT XP VALUES
--------------------------------
Open config.json.
Change numbers under "xp".
Example:
"follow": 25

--------------------------------
EDIT RANK XP REQUIREMENTS
--------------------------------
Open config.json.
Each rank has an xp number.
Lower number = faster ranking up.
Higher number = slower grind.

--------------------------------
RANK IMAGES
--------------------------------
Images are inside:
public/assets/ranks

They are already wired into the overlay.

--------------------------------
TEST URLS
--------------------------------
Dashboard:
http://localhost:3000

Overlay:
http://localhost:3000/overlay

Random test event:
http://localhost:3000/test

Manual follow test:
http://localhost:3000/event/follow?user=Noah

Manual gift test:
http://localhost:3000/event/gift?user=Noah&xp=500
