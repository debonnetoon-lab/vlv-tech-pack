on run
  set appDir to "/Users/toondebonne/.gemini/antigravity/scratch/fashion-tech-pack-v2"
  set port to "3000"
  
  -- Check if server is already running
  set serverRunning to do shell script "lsof -i :" & port & " -t 2>/dev/null | wc -l | tr -d ' '"
  
  if serverRunning as integer = 0 then
    -- Start the dev server in background
    do shell script "cd " & quoted form of appDir & " && nohup npm run dev > /tmp/vlv-techpack.log 2>&1 &"
    
    -- Wait up to 30 seconds for it to be ready
    repeat 30 times
      try
        do shell script "curl -s --max-time 1 http://localhost:" & port & " > /dev/null 2>&1"
        exit repeat
      end try
      delay 1
    end repeat
  end if
  
  -- Open in Chrome as a standalone app window
  do shell script "open -n -a 'Google Chrome' --args --app='http://localhost:" & port & "' --window-size=1440,900"
end run
