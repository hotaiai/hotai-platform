@echo off
echo Setting up Vercel deployment...

REM Set environment variables
set VERCEL_TOKEN=wdMHRxcXj5e92a3pagchpl9w
set VERCEL_ORG_ID=team_Mm1j9VXsVSOtJgVgSopXHvaE
set VERCEL_PROJECT_ID=

REM Deploy to Vercel
echo Deploying to Vercel...
vercel --token %VERCEL_TOKEN% --yes --prod

pause