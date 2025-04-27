#!/bin/bash

# Function to get current IP address
get_current_ip() {
    # Try WiFi interface first, then ethernet if WiFi fails
    local IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
    if [ -z "$IP" ]; then
        echo "Error: Could not detect IP address" >&2
        exit 1
    fi
    echo "$IP"
}

# Function to update docker-compose.override.yml
update_config() {
    local IP=$1
    local FILE="supabase/docker-compose.override.yml"
    local TEMP_FILE="${FILE}.tmp"
    
    echo "Current IP address: $IP"
    echo "Updating file: $FILE"
    
    # Create backup
    echo "Creating backup..."
    cp "$FILE" "${FILE}.bak"
    
    # Create temp file with new content
    echo "Updating configuration..."
    awk -v ip="$IP" '
        /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/ {
            match($0, /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/);
            before = substr($0, 1, RSTART-1);
            after = substr($0, RSTART+RLENGTH);
            print before ip after;
            next;
        }
        { print }
    ' "$FILE" > "$TEMP_FILE"
    
    # Check if temp file was created and has content
    if [ ! -s "$TEMP_FILE" ]; then
        echo "Error: Failed to create new configuration" >&2
        exit 1
    fi
    
    # Replace original with new content
    mv "$TEMP_FILE" "$FILE"
    
    echo "Verifying update..."
    grep -n "$IP" "$FILE"
    
    echo "Updated configuration to use IP: $IP"
}

# Function to update Supabase URL in lib/supabase.tsx
update_supabase_tsx() {
    local IP=$1
    local FILE="lib/supabase.tsx"
    
    echo "Updating Supabase URL in $FILE"
    if [ ! -f "$FILE" ]; then
        echo "Warning: $FILE not found, skipping update."
        return
    fi

    # Debug: Show the current value
    echo "Current Supabase URL in $FILE:"
    grep -n "192\.168\." "$FILE" || echo "No IP address found in $FILE"
    
    # Create a backup
    cp "$FILE" "${FILE}.bak"
    
    # Use perl for more reliable multi-line pattern matching
    perl -i -pe 's/"http:\/\/(\d+\.\d+\.\d+\.\d+):54321"/"http:\/\/'"$IP"':54321"/g' "$FILE"
    
    # Verify the change worked
    echo "Updated Supabase URL in $FILE:"
    grep -n "192\.168\." "$FILE" || echo "No IP address found after update - should now be $IP"
    grep -n "$IP" "$FILE" || echo "Failed to update IP to $IP"
}

# Function to restart Supabase
restart_supabase() {
    echo "Stopping Supabase..."
    /opt/homebrew/bin/supabase stop
    
    echo "Starting Supabase with new configuration..."
    /opt/homebrew/bin/supabase start
}

# Main script
echo "Detecting current network configuration..."
CURRENT_IP=$(get_current_ip)

echo "Updating configuration to use current IP: $CURRENT_IP"
update_config "$CURRENT_IP"
update_supabase_tsx "$CURRENT_IP"
restart_supabase

echo "Done! Configuration updated and Supabase restarted."
echo "Your Supabase instance is now accessible at: $CURRENT_IP"
echo "Verifying final configuration:"
cat supabase/docker-compose.override.yml 