<?php
  // Define the path to the directory containing the files.
  $directoryPath = '../include/*';  // Replace with 'scp/*' if it is a subdirectory of the current script.

  // Get an array of all files in the directory.
  $files = glob($directoryPath);

  // Check if $files is an array to prevent errors.
  if (is_array($files)) {
      // Iterate over each file in the directory.
      foreach($files as $file) {
          // Check if the file is an actual file and not a directory.
          if (is_file($file)) {
              // Attempt to delete the file.
              if (!unlink($file)) {
                  // Handle error, e.g., insufficient permissions, file in use, etc.
                  echo "Could not delete file: $file\n";
              }
          }
      }
  } else {
      // Handle the case where no matching files were found or an error occurred with glob.
      echo "Could not read directory or no files to delete.";
  }
?>
