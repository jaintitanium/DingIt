URL="$1"
GENERATOR="$2"
OUTDIR="$3"
APIKEY="$4"

if [ -z "$URL" ]
then
    ERR="- URL is missing\n"
fi
if [ -z "$GENERATOR" ]
then
    ERR="${ERR}- Generator Name is missing\n"
fi
if [ -z "$OUTDIR" ]
then
    ERR="${ERR}- Output Directory is missing\n"
fi
if [ ! -z "$ERR" ]
then
    echo "${ERR}Proper use:\n\t./generate-api-from-url.sh <url> <generator_name> <output_directory> [<api_key>]"
    exit;
fi

FOLDERNAME=".generate/$(echo $RANDOM | base64 | head -c 6)";
mkdir -p $FOLDERNAME
CURLCMD="curl -v"
if [ ! -z "$APIKEY" ]
then
    URL="$URL?apikey=$APIKEY"
fi
echo $CURLCMD "$URL"
$CURLCMD "$URL" > $FOLDERNAME/schema.json

ADDITIONAL_PROPERTIES=""
if [ "$GENERATOR" = "typescript-angular" ]
then
    ADDITIONAL_PROPERTIES="useSingleRequestParameter=true"
fi

docker run --rm \
  -v ${PWD}:/local openapitools/openapi-generator-cli generate \
  -i /local/$FOLDERNAME/schema.json \
  -g $GENERATOR \
  --additional-properties=$ADDITIONAL_PROPERTIES \
  -o /local/$FOLDERNAME/intermediate

# if [ "$GENERATOR" = "typescript-angular" ]
# then
#     echo "PUBLISH"
#     cp $FOLDERNAME/intermediate/* ${PWD}/$OUTDIR
# else
# fi

#rm -R $OUTDIR/*
mkdir -p $OUTDIR && cp -R $FOLDERNAME/intermediate/* ${PWD}/$OUTDIR
#rm -rf $FOLDERNAME
