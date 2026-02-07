indent() { sed 's/^/    /'; }

cd frontend
echo 'Installing Frontend Dependencies'
npm install | indent
echo '\nBuilding Frontend'
npm run build | indent
cd ..
cp -r ./frontend/dist ./static
python -m venv venv
source venv/bin/activate
echo '\nInstalling Server Dependencies'
pip install -r requirements.txt | indent
