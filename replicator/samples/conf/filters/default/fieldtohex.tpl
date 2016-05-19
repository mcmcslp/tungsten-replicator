# Fixes up strings emanating from MySQL by converting them correctly to 
# Unicode string (char/varchar) or blob (binary/varbinary/blob data) depending 
# on the originating column type. 
# Takes an explicit JSON file to choose which fields to translate to hex
#
# This filter must run after colnames and before pkey. 
replicator.filter.fieldtohex=com.continuent.tungsten.replicator.filter.JavaScriptFilter                                
replicator.filter.fieldtohex.script=${replicator.home.dir}/support/filters-javascript/fieldtohex.js
replicator.filter.fieldtohex.definitionsFile=~/fieldtohex.json
