# clinical-concept-explorer

A clinical named entity extraction interface that extracts clinical concepts from user inputted text and maps them to their corresponding structured, UMLS concepts (CUI's) using the MetamapLite API. In other words, you should be using the MetamapLiteAPI for concept extraction and CUI mapping and then showing the returned information in the UI. Note that my UMLS API key is: ea95a1ba-a529-42af-a2d4-468363f4e3f7

MetamapLite API schema (JSON):
openapi: 3.0.1
info:
  title: MetaMapLite GPT Integration
  description: This specification defines the interface for a custom GPT to interact with the MetaMapLite ReSTful API for
    Named Entity Recognition (NER).
  version: 1.0.1
servers:
  - url: https://ii.nlm.nih.gov
paths:
  /metamaplite/rest/annotate:
    post:
      summary: Annotate text with medical entities
      operationId: annotateText
      parameters:
        - name: apiKey
          in: query
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - inputtext
                - docformat
                - resultformat
              properties:
                inputtext:
                  type: string
                  description: The text to be analyzed for medical entities.
                docformat:
                  type: string
                  enum:
                    - freetext
                    - sli
                    - sldiwi
                    - pubmed
                    - medline
                  description: The document format of the input text.
                resultformat:
                  type: string
                  enum:
                    - brat
                    - mmi
                    - full
                    - json
                    - cui
                  description: The desired output format for the results.
      responses:
        "200":
          description: A list of recognized medical entities.
          content:
            application/json:
              schema:
                type: object
                properties:
                  entities:
                    type: array
                    items:
                      type: object
                      properties:
                        cui:
                          type: string
                          description: The Concept Unique Identifier for the recognized entity.
                        name:
                          type: string
                          description: The name of the recognized entity.
                        position:
                          type: integer
                          description: Position of the entity in the input text.
                        context:
                          type: string
                          description: Contextual details about the entity.
        "400":
          description: Invalid request parameters.
        "500":
          description: Internal server error.



MetamapLite RestFul Client:
""" MetaMapLite ReST client

Currently allows setting request content-type and accept context-type
fields of http request.

content fields include:
   inputext: input document to be processed
   docformat: format of input document: freetext, medline, pubmedxml, etc.
   resultformat: format of result: mmi, brat, etc.
   sourceString: list of sources to restrict to. (comma separated)
   semanticTypeString: list of semantic types to restrict to. (comma separated)

Sample use of mmlrestclient.py:

   python mmlrestclient.py https://ii-public1.nlm.nih.gov/metamaplite/rest/annotate \
          ~/queries/testdoc.txt --output outfile
   python mmlrestclient.py https://ii-public2vm.nlm.nih.gov/metamaplite/rest/annotate \
          ~/queries/testdoc.txt --output outfile


Usage:

  usage: mmlrestclient.py [-h] [--req-content-type REQ_CONTENT_TYPE]
                          [--res-content-type RES_CONTENT_TYPE]
                          [--docformat DOCFORMAT] [--resultformat RESULTFORMAT]
                          [--sources SOURCES] [--semantic-types SEMANTIC_TYPES]
                          [--output OUTPUT]
                          url file

ReST client

positional arguments:
  url                   url of server
  file                  file to send in request

optional arguments:
  -h, --help            show this help message and exit
  --req-content-type REQ_CONTENT_TYPE
                        content-type of request
  --res-content-type RES_CONTENT_TYPE
                        content-type of response
  --docformat DOCFORMAT
                        format of input document
  --resultformat RESULTFORMAT
                        format of metamaplite result
  --sources SOURCES     restrict to list of UMLS sources abbreviations separated by commas
  --semantic-types SEMANTIC_TYPES
                        restrict to list of UMLS semantic types separated by commas
  --output OUTPUT       file to send response content, default is standard
                        output


"""
import sys
import argparse
import requests

def readtextfile(filename):
    """ read text file specified by filename """
    textfp = open(filename)
    text = textfp.read()
    textfp.close()
    return text

def package_payload(argdict):
    """ generate payload parameters from arguments """
    if 'inputtext' in argdict:
        inputtext = argdict('inputtext')
    else:
        inputtext = readtextfile(argdict['file'])
    req_content_type = argdict['req_content_type']
    print('req_content_type = {}'.format(req_content_type))
    params = []
    params.append(('inputtext', inputtext))
    params.append(('docformat', argdict['docformat']))
    params.append(('resultformat', argdict['resultformat']))
    for source in argdict['sources'].split(','):
        params.append(('sourceString', source))
    for semtype in argdict['semantic_types'].split(','):
        params.append(('semanticTypeString', semtype))
    return params

def handle_request(url, acceptfmt, payload):
    """
    Send request to ReST service and return response when received.

    >>> url = 'https://ii-public1.nlm.nih.gov/metamaplite/rest/annotate'
    >>> acceptfmt = 'text/plain'
    >>> params = [('inputtext', 'Apnea\n'), ('docformat', 'freetext'),
                   ('resultformat', 'json'), ('sourceString', 'all'),
                   ('semanticTypeString', 'all')]
    >>> resp = handle_request(url, acceptfmt, params)
    >>> resp.text
    '[{"matchedtext":"Apnea",
       "evlist":[{"score":0,"matchedtext":"Apnea","start":0,"length":5,"id":"ev0",
                   "conceptinfo":{"conceptstring":"Apnea",
                                  "sources":["MTH","NCI_CTCAE_5","NCI","NCI_CTCAE_3"],
                                  "cui":"C1963065","preferredname":"Apnea, CTCAE",
                                  "semantictypes":["fndg"]}},
                 {"score":0,"matchedtext":"Apnea","start":0,"length":5,"id":"ev0",
                  "conceptinfo":{"conceptstring":"Apnea",
                                 "sources":["LNC","MTH","HPO","NANDA-I","ICPC2P","CHV",
                                            "SNMI","SNM","NCI_FDA","LCH_NW","AOD","ICD9CM",
                                            "MDR","SNOMEDCT_US","CCPSS","WHO","NCI_NICHD",
                                            "CSP","RCDSA","MSH","ICD10CM","CST","OMIM",
                                            "NCI_CTCAE","ICPC2ICD10ENG","COSTAR","MEDCIN",
                                            "LCH","RCD","RCDAE","NCI","PSY","NDFRT","RCDSY",
                                            "DXP","ICNP"],
                                 "cui":"C0003578","preferredname":"Apnea",
                                 "semantictypes":["sosy"]}}],
        "docid":"00000000.tx","start":0,"length":5,"id":"en0","fieldid":"text"}]'
    """
    headers = {'Accept' : acceptfmt}
    return requests.post(url, payload, headers=headers)

def process(argdict):
    """Process command line arguments and call handle_request. """
    payload = package_payload(argdict)
    sys.stderr.write('%s\n' % payload)
    # contenttype = argdict['req_content_type'],
    acceptfmt = argdict['res_content_type']
    return handle_request(argdict['url'], acceptfmt, payload)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        parser = argparse.ArgumentParser(description="ReST client")
        parser.add_argument('url',
                            help='url of server')
        parser.add_argument('file', help='file to send in request')
        parser.add_argument('--req-content-type', default='application/x-www-form-urlencoded',
                            help='content-type of request')
        parser.add_argument('--res-content-type', default='text/plain',
                            help='content-type of response')
        parser.add_argument('--docformat', default='freetext',
                            help='format of input document')
        parser.add_argument('--resultformat', default='mmi',
                            help='format of metamaplite result')
        parser.add_argument('--sources', default='all',
                            help='list of UMLS sources to restrict to. (comma separated)')
        parser.add_argument('--semantic-types', default='all',
                            help='list of UMLS semantic types to restrict to separated by commas')

        parser.add_argument('--output', default='stdout',
                            help='file to send response content, default is standard output')

        args = parser.parse_args()
        print(args)
        resp = process(vars(args))
        sys.stderr.write('resp = %s\n' % resp)
        if vars(args)['output'] == 'stdout':
            sys.stdout.write('%s\n' % resp.text)
        else:
            fp = open(vars(args)['output'], 'w')
            fp.write('%s\n' % resp.text)
            fp.close()

## Collaborate with GPT Engineer

This is a [gptengineer.app](https://gptengineer.app)-synced repository 🌟🤖

Changes made via gptengineer.app will be committed to this repo.

If you clone this repo and push changes, you will have them reflected in the GPT Engineer UI.

## Tech stack

This project is built with .

- Vite
- React
- shadcn-ui
- Tailwind CSS

## Setup

```sh
git clone https://github.com/GPT-Engineer-App/clinical-concept-explorer.git
cd clinical-concept-explorer
npm i
```

```sh
npm run dev
```

This will run a dev server with auto reloading and an instant preview.

## Requirements

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
