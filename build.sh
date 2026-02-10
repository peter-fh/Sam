indent() { sed 's/^/    /'; }

cd frontend
echo 'Installing Frontend Dependencies'
npm install | indent
echo '\nBuilding Frontend'
npm run build | indent
cd ..

git clone https://github.com/peter-fh/Sam-Prompts.git

cp -r ./frontend/dist ./static
cp -r ./Sam-Prompts/prompts ./prompts
python -m venv venv
source venv/bin/activate
echo '\nInstalling Server Dependencies'
pip install -r requirements.txt | indent
