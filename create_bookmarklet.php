<?php

function google_min($new_file)
{
	//Get a much-minified version from Google's closure compiler
	$ch = curl_init('http://closure-compiler.appspot.com/compile');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, 'output_info=compiled_code&output_format=text&compilation_level=SIMPLE_OPTIMIZATIONS&js_code=' . urlencode($new_file));
	$output = curl_exec($ch);
	curl_close($ch);
	echo 'Minified code created<hr />';

	return $output;
}

$js_lib = file_get_contents("src/randexp.min.js");
$js = file_get_contents("src/LazyFormFuzz-src.js");
$lff = google_min($js);

$new_file = "javascript:{$js_lib};{$lff}";

file_put_contents("LazyFormFuzz.js", $new_file);

echo "Bookmarklet created\n";

