def validate_metric(line: str) -> (bool, list):
    """
    Valkyrie uses the Influx Data Protocol.
    Reference: https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/

    // Format
    <measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]

    // Example
    measurement,tag1=value1,tag2=value2 fieldKey="fieldValue" 1556813561098000000

    Examples:
    cx_metrics,state=MI,city=Detroit,base=DTW,company=techcorp,intent=support customer_id=12360,negative=1,neutral=1,positive=1 1596484800
    cx_metrics,state=PA,city=Philadelphia,base=PHL,company=techcorp,intent=buy customer_id=12361,negative=0,neutral=1,positive=2 1596484800
    cx_metrics,state=WA,city=Spokane,base=GEG,company=techcorp,intent=support customer_id=12362,negative=2,neutral=0,positive=1 1596484800
    
    Rules:
        - measurement:
            - measurement name is the first element
            - measurement name must be lowercase
            - measurement name must start with a letter
            - measurement must contain only alphanumeric characters.
            - measurement may contain underscores (_). 
            - Example of valid measurement names: cx_metrics, sales, customer.
            - Measurement is separated from tags by a comma
        - tags:
            - tags are key=value pairs. Example: state=MI,city=Detroit,base=DTW,company=techcorp,intent=support
            - tags are separated by commas
            - tags are optional, so if they are not present, the line is still valid
            - tag_key:
                - tag_key is the key of the tag
                - tag_key must be alphanumeric
                - tag_key must start with a letter
                - tag_key must be lowercase
                - tag_key may contain underscores (_)
            - tag_value:
                - tag_value is the value of the tag
                - tag_value can be a numeric value or a string
                - tag_value can contain spaces, 
                  but they must be escaped with the backslash character: \
        - fields:
            - fields are mandatory.
            - fields are also key=value pairs. Example: customer_id=12360,negative=1,neutral=1,positive=1
            - fields are separated by commas
            - field_key:
                - field_key is the key of the field
                - field_key must be alphanumeric
                - field_key must start with a letter
                - field_key must be lowercase
                - field_key may contain underscores (_)
            - field_value:
                - field_value is the value of the field
                - field_value can be a numeric value or a string
                - field_value can contain spaces, 
                  but they must be escaped with the backslash character: \
        - timestamp:
            - the timestamp is a 64-bit integer, unix timestamp in nanoseconds
            - the timestamp is optional, so if it is not present, the line is still valid
        - line:
            - the line is split by \n character (line break)
            - the line has 2 or 3 parts separated by spaces
            - the first part is the measurement and tags
            - the second part is the fields
            - the third part is the timestamp (optional)
        
    The line received must conform to this standard.
    If there is an error, the function returns False and the error in a list
    """
    # measurement is the first element, 
    # separated from the rest by a comma
    parts = line.split(",")
    measurement = parts[0]
    if not check_name(measurement):
        return False, [ f"Invalid measurement name: {measurement}" ]
    # Trailing spaces in the start and end of line
    parts = line.strip().replace("\\ ", "%20")[line.index(",") + 1: ].split(" ")
    print(parts)
    # Only have metrics
    if len(parts) == 1:
        # Validate metrics
        metrics = check_metrics(parts[0])
        print(metrics)
        if metrics[0] == False:
            return False, metrics[1]
    # Have metrics and timestamp
    elif len(parts) == 2 and parts[1].isnumeric():
        # Validate metrics
        metrics = check_metrics(parts[0])
        if metrics[0] == False:
            return False, metrics[1]
        # Validate timestamp
        if not check_timestamp(parts[1]):
            return False, [ f"Invalid timestamp: {parts[1]}" ]
    # Have tags, metrics
    elif len(parts) == 2 and not parts[1].isnumeric():
        tags = check_tags(parts[0])
        if tags[0] == False:
            return False, tags[1]
        metrics = check_metrics(parts[1])
        if metrics[0] == False:
            return False, metrics[1]
    # Have tags, metrics and timestamp
    elif len(parts) == 3 and parts[2].isnumeric():
        tags = check_tags(parts[0])
        if not tags[0]:
            return False, tags[1]
        metrics = check_metrics(parts[1])
        if not metrics[0]:
            return False, metrics[1]
        if not check_timestamp(parts[2]):
            return False, [ f"Invalid timestamp: {parts[2]}" ]
    else:
        return False, [ f"Invalid line format: <measurement>" +
                       "[,<tag_key>=<tag_value>" +
                       "[,<tag_key>=<tag_value>]] <field_key>=<field_value>" +
                       "[,<field_key>=<field_value>] [<timestamp>]" ]
    return True, []

def check_name(name: str) -> bool:
    """
    Validate the name of a resource.
    The name must be alphanumeric, lowercase and start with a letter.
    """
    if not name[0].isalpha() or \
        not name.islower() or \
        not all(c.isalnum() or c == '_' for c in name):
        return False
    return True

def check_metrics(part: str) -> (bool, list):
    metrics = part.split(",")
    for metric in metrics:
        key, value = metric.split("=")
        if not check_name(key):
            return False, [ f"Invalid metric name: {key}" ]
    return True, []

def check_tags(part: str) -> (bool, list):
    tags = part.split(",")
    for tag in tags:
        key, value = tag.split("=")
        if not check_name(key):
            return False, [ f"Invalid tag name: {key}" ]
    return True, []

def check_timestamp(part: str) -> bool:
    return part.isnumeric()