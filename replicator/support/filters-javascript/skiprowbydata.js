var rowbydata = {};

function readJSONFile(path)
{
    var file = new java.io.BufferedReader(new java.io.FileReader(new java.io.File(path)));

    var sb = "";
    while((line = file.readLine()) != null)
    {
        sb = sb + line + java.lang.System.getProperty("line.separator");
    }

    jsonval = eval("(" + sb + ")");

    return jsonval;
}

function prepare()
{
    logger.debug("skiprowbydata: Initializing...");  

    var jsonFile = filterProperties.getString("definitionsFile");

    logger.info("skiprowbydata filter: loading json config file " + jsonFile);  

    var rawrowbydata = readJSONFile(jsonFile);

    for (var schemaname in rawrowbydata) 
    {
        var schema = rawrowbydata[schemaname];

        if (schema !== null && typeof schema === "object")
        {
            for (var tablename in schema)
            {
                var table = schema[tablename];

                if (table !== null && typeof table === "object")
                {
                    for (var columnname in table)
                    {
                        var column = table[columnname];

                        if (column !== null && typeof column === "object")
                        {
                            var stc = schemaname + '.' + tablename + '.' + columnname;

                            for(var i=0;i<column.length;i++)
                            {
                                var value = column[i];

                                if (stc in rowbydata)
                                {
                                    rowbydata[stc].push(value);
                                }
                                else
                                {
                                    rowbydata[stc] = [value];
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function filter(event)
{
  data = event.getData();
  if(data != null)
  {
    for (i = 0; i < data.size(); i++)
    {
      d = data.get(i);

      if (d != null && d instanceof com.continuent.tungsten.replicator.dbms.StatementData)
      {
          // Ignore statements
      }
      else if (d != null && d instanceof com.continuent.tungsten.replicator.dbms.RowChangeData)
      {
          skiprowdata(event, d);
      }
    }
  }
}

function skiprowdata(event, d)
{
    var skipme = 0;
    rowChanges = d.getRowChanges();

    charsetName = d.getOption("##charset");
    if (charsetName == null)
        charset = null;
    else
        charset = java.nio.charset.Charset.forName(charsetName);

    var removelist = new Array();
    
    for(j = 0; j < rowChanges.size(); j++)
    {
        logger.debug("SRBD: Starting ROW loop");

        oneRowChange = rowChanges.get(j);
        var schema = oneRowChange.getSchemaName();
        var table = oneRowChange.getTableName();
        var columns = oneRowChange.getColumnSpec();
        
        columnValues = oneRowChange.getColumnValues();
        for (c = 0; c < columns.size(); c++)
        {
            logger.debug("  SRBD: Starting Column loop");
            columnSpec = columns.get(c);
            columnname = columnSpec.getName();
            logger.debug("  SRBD: Column name: " + columnname);
            
            var stc = schema + '.' + table + '.' + columnname;
            
            logger.debug("  SRBD: stc: " + stc);

            if (stc in rowbydata)
            {
                logger.debug("    SRBD: STC Matches: " + stc);

                for (row = 0,realrow = 0; row < columnValues.size(); row++,realrow++)
                {
                    logger.debug("      SRBD: Starting ROW Data loop: " + row);

                    values = columnValues.get(row);

		    if (values.get(c).getValue() === null) {
			continue;
		    }
		    
		    if (charset === null) {
			value = new java.lang.String(values.get(c).getValue());
		    } else {
			value = new java.lang.String(values.get(c).getValue(), charset);
		    }

                    logger.debug("      SRBD: checking value: " + value);
                    logger.debug("      SRBD: row value: " + j);
                    logger.debug("      SRBD: rowbydata size: " + rowbydata[stc].length);
                    logger.debug("      SRBD: rowbydata size: " + rowbydata[stc]);
                    
                    for(vr = 0; vr < rowbydata[stc].length; vr++)
                    {
                        vregex = new RegExp(rowbydata[stc][vr]);
                        logger.debug("      SRBD: checking regex: " + rowbydata[stc][vr] );                        

                        if (vregex.exec(value))
                        {
                            logger.debug("        SRBD: removing value: " + value);
                            logger.debug("        SRBD: rowCount (j) value: " + j);
                            logger.debug("        SRBD: columnCount (c) value: " + c);
                            logger.debug("        SRBD: row value: " + row);

                            logger.info("skiprowbydata: removing row due to a regex match of '" + rowbydata[stc][vr] + "' in column " + table + '.' + columnname );
                            
                            rowChanges.remove(j);
                            skipme = 1;
                            break;
                            
                            columnValues.remove(row);
                            row--;
                        }
                    }
                }
                logger.debug("    SRBD: END STC Matches: " + stc);
                if (skipme == 1) {
                	break;
                }
            }

            logger.debug("  SRBD: End Column loop");
			if (skipme == 1) {
				skipme = 0;
				break;
			}
        }

        logger.debug("SRBD: End ROW loop");
    }
}
