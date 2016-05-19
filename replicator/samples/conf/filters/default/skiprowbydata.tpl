# Skip rows in a source replicator based on the contents of one or more fields
#
# This filter must run after colnames and before pkey. 
replicator.filter.skiprowbydata=com.continuent.tungsten.replicator.filter.JavaScriptFilter                                
replicator.filter.skiprowbydata.script=${replicator.home.dir}/support/filters-javascript/skiprowbydata.js
replicator.filter.skiprowbydata.definitionsFile=~/skiprowbydata.json
