const express = require('express');
const CryptoJS = require('crypto-js');
const aws = require('aws-sdk');

const router = express.Router();  // eslint-disable-line new-cap

const clientSecretKey = '39pN7SuzgZhe1POo6SX/WMxH2Pstsy+euw+7HDxr';
const serverPublicKey = 'AKIAJZEHJEYTVA6QQ2HQ';
const serverSecretKey = '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';

const expectedBucket = 'fashionbloggingapp';
const expectedHostname = 'fashionbloggingapp.s3.amazonaws.com';

const expectedMinSize = null;
const expectedMaxSize = null;


// Init S3, given your server-side keys.  Only needed if using the AWS SDK.
aws.config.update({
  accessKeyId: serverPublicKey,
  secretAccessKey: serverSecretKey,
});

const s3 = new aws.S3();


router.post('/sign', (req, res) => {
  signRequest(req, res);
});

router.post('/success', (req, res) => {
  verifyFileInS3(req, res); // eslint-disable-line new-cap
  console.log(req.body);
});

module.exports = router;


// Ensures the policy document associated with a "simple" (non-chunked) request is
// targeting the correct bucket and the min/max-size is as expected.
// Comment out the expectedMaxSize and expectedMinSize variables near
// the top of this file to disable size validation on the policy document.
function isPolicyValid(policy) {
  let bucket;
  let parsedMaxSize;
  let parsedMinSize;
  let isValid;
  policy.conditions.forEach((condition) => {
    if (condition.bucket) {
      bucket = condition.bucket;
    } else if (condition instanceof Array && condition[0] === 'content-length-range') {
      parsedMinSize = condition[1];
      parsedMaxSize = condition[2];
    }
  });
  isValid = bucket === expectedBucket;
  // If expectedMinSize and expectedMax size are not null (see above), then
  // ensure that the client and server have agreed upon the exact same
  // values.
  if (expectedMinSize != null && expectedMaxSize != null) {
    isValid = isValid && (parsedMinSize === expectedMinSize.toString())
          && (parsedMaxSize === expectedMaxSize.toString());
  }
  return isValid;
}

function getV2SignatureKey(key, stringToSign) {
  const words = CryptoJS.HmacSHA1(stringToSign, key);
  return CryptoJS.enc.Base64.stringify(words);
}

function getV4SignatureKey(key, dateStamp, regionName, serviceName, stringToSign) {
  const kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
  const kRegion = CryptoJS.HmacSHA256(regionName, kDate);
  const kService = CryptoJS.HmacSHA256(serviceName, kRegion);
  const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);

  return CryptoJS.HmacSHA256(stringToSign, kSigning).toString();
}

function signV2RestRequest(headersStr) {
  return getV2SignatureKey(serverSecretKey, headersStr);
}

function signV4RestRequest(headersStr) {
  const matches = /.+\n.+\n(\d+)\/(.+)\/s3\/aws4_request\n([\s\S]+)/.exec(headersStr);
  const hashedCanonicalRequest = CryptoJS.SHA256(matches[3]);
  const stringToSign = headersStr.replace(/(.+s3\/aws4_request\n)[\s\S]+/, '$1' + hashedCanonicalRequest);

  return getV4SignatureKey(serverSecretKey, matches[1], matches[2], 's3', stringToSign);
}

function signV2Policy(base64Policy) {
  return getV2SignatureKey(serverSecretKey, base64Policy);
}

function signV4Policy(policy, base64Policy) {
  const conditions = policy.conditions;
  let credentialCondition;
  for (let i = 0; i < conditions.length; i++) {
    credentialCondition = conditions[i]['x-amz-credential'];
    if (credentialCondition != null) {
      break;
    }
  }
  const matches = /.+\/(.+)\/(.+)\/s3\/aws4_request/.exec(credentialCondition);
  return getV4SignatureKey(serverSecretKey, matches[1], matches[2], 's3', base64Policy);
}

// Signs "simple" (non-chunked) upload requests.
function signPolicy(req, res) {
  const policy = req.body;
  const base64Policy = new Buffer(JSON.stringify(policy)).toString('base64');
  const signature = req.query.v4 ? signV4Policy(policy, base64Policy) : signV2Policy(base64Policy);

  const jsonResponse = {
    policy: base64Policy,
    signature: signature,
  };

  res.setHeader('Content-Type', 'application/json');

  if (isPolicyValid(req.body)) {
    res.end(JSON.stringify(jsonResponse));
  } else {
    res.status(400);
    res.end(JSON.stringify({ invalid: true }));
  }
}

// Ensures the REST request is targeting the correct bucket.
// Omit if you don't want to support chunking.
function isValidRestRequest(headerStr, version) {
  if (version === 4) {
    return new RegExp('host:' + expectedHostname).exec(headerStr) != null;
  }
  return new RegExp('\/' + expectedBucket + '\/.+$').exec(headerStr) != null;
}

// Signs multipart (chunked) requests.  Omit if you don't want to support chunking.
function signRestRequest(req, res) {
  const version = req.query.v4 ? 4 : 2;
  const stringToSign = req.body.headers;
  const signature = version === 4 ? signV4RestRequest(stringToSign) : signV2RestRequest(stringToSign);

  const jsonResponse = {
    signature: signature
  };

  res.setHeader('Content-Type', 'application/json');

  if (isValidRestRequest(stringToSign, version)) {
    res.end(JSON.stringify(jsonResponse));
  } else {
    res.status(400);
    res.end(JSON.stringify({ invalid: true }));
  }
}

// Signs any requests.  Delegate to a more specific signer based on type of request.
function signRequest(req, res) {
  if (req.body.headers) {
    signRestRequest(req, res);
  } else {
    signPolicy(req, res);
  }
}

function callS3(type, spec, callback) {
  s3[type + 'Object']({
    Bucket: spec.bucket,
    Key: spec.key,
  }, callback);
}


function deleteFile(bucket, key, callback) {
  callS3('delete', {
    bucket: bucket,
    key: key,
  }, callback);
}

// After the file is in S3, make sure it isn't too big.
// Omit if you don't have a max file size, or add more logic as required.
function verifyFileInS3(req, res) {
  function headReceived(err, data) {
    if (err) {
      res.status(500);
      console.log(err);
      res.end(JSON.stringify({ error: 'Problem querying S3!' }));
    } else if (expectedMaxSize && data.ContentLength > expectedMaxSize) {
      res.status(400);
      res.write(JSON.stringify({ error: 'Too big!' }));
      deleteFile(req.body.bucket, req.body.key, (err) => {
        if (err) {
          console.log("Couldn't delete invalid file!");
        }
        res.end();
      });
    } else {
      res.end();
    }
  }
  callS3('head', {
    bucket: req.body.bucket,
    key: req.body.key,
  }, headReceived);
}
