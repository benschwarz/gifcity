# GIFCITY WHAT WHAT

# Transcoding to MP4 using AWS

### 1. Upload files to an S3 bucket

Made a simple node js server on Heroku. Needs AWS_ACCESS_KEY, AWS_SECRET_KEY and BUCKET_NAME

    git remote add gifcity-s3-uploader git@heroku.com:gifcity-s3-uploader.git
    heroku --app gifcity-s3-uploader config:set AWS_ACCESS_KEY=LOLO
    git subtree push --prefix s3uploader gifcity-s3-uploader master

Hit it up on http://gifcity-s3-uploader.herokuapp.com/?src=http://25.media.tumblr.com/tumblr_SOMETHING.gif

### 2. Convert GIF to MP4 using Amazon

Another simple nodejs server.

    git remote add gifcity-elastic-transcoder git@heroku.com:gifcity-elastic-transcoder.git
    heroku --app gifcity-elastic-transcoder config:set AWS_ACCESS_KEY=LOLO etc
    git subtree push --prefix elastic-transcoder gifcity-elastic-transcoder master