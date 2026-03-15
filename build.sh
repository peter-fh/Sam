indent() { sed 's/^/    /'; }

rm -rf ./static
rm -rf ./prompts

cd frontend
echo 'Installing Frontend Dependencies'
npm install | indent
echo '\nBuilding Frontend'
npm run build | indent
cd ..
cp -r ./frontend/dist ./static


echo '\nCloning prompts'
# Clone prompts from prompt repo
git clone https://github.com/peter-fh/Sam-Prompts.git | indent
cp -r ./Sam-Prompts/prompts ./prompts
rm -rf ./Sam-Prompts

echo '\nInstalling Server Dependencies'
# Install dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt | indent
