echo "Creating project..."
mkdir "$2"
cd "$2"
curl --progress-bar http://ultimatedtesting.com/examples/example-phonegap.tar.gz --output ./temp.tar.gz
tar xf temp.tar.gz
pwd=`pwd`
mkdir .ultimated
cp  ~/.ultimated/packages/ultimated-core/latest/release-version "$pwd/.ultimated"
RELEASE_NODE_SUITE=`cat ~/.ultimated/packages/ultimated-core/latest/release-node-suite`
ln -s ~/.ultimated/packages/node-suites/$RELEASE_NODE_SUITE/lib/node_modules "$pwd/.ultimated/node_modules"
rm temp.tar.gz
echo ""
echo "Project ready"
echo ""
echo "Let's start right away! Plug in an Android device and type:"
echo "  cd $2"
echo "  ultimated"
echo ""