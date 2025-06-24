import { PHP, startPHP, Version } from './php-wasm/php';
import { useEffect, useState } from 'react';
import { CodingStandard } from './format';

async function loadPHPLoaderModule(v: Version) {
	switch (v) {
		case '5.6':
			// @ts-ignore
			return import('./wasm-assets/php-5.6.js');
		case '7.0':
			// @ts-ignore
			return import('./wasm-assets/php-7.0.js');
		case '7.1':
			// @ts-ignore
			return import('./wasm-assets/php-7.1.js');
		case '7.2':
			// @ts-ignore
			return import('./wasm-assets/php-7.2.js');
		case '7.3':
			// @ts-ignore
			return import('./wasm-assets/php-7.3.js');
		case '7.4':
			// @ts-ignore
			return import('./wasm-assets/php-7.4.js');
		case '8.0':
			// @ts-ignore
			return import('./wasm-assets/php-8.0.js');
		case '8.1':
			// @ts-ignore
			return import('./wasm-assets/php-8.1.js');
		case '8.2':
			// @ts-ignore
			return import('./wasm-assets/php-8.2.js');
		case '8.3':
			// @ts-ignore
			return import('./wasm-assets/php-8.3.js');
		case '8.4':
			// @ts-ignore
			return import('./wasm-assets/php-8.4.js');
		default:
			/* eslint no-case-declarations: 0 */
			/* eslint @typescript-eslint/no-unused-vars: 0 */
			const x: never = v;
			throw Error('not defined version');
	}
}

export async function initPHP(v: Version) {
	// todo handling when load failed
	const PHPLoaderModule = await loadPHPLoaderModule(v);
	return startPHP(v, PHPLoaderModule, 'WEB', {});
}

export async function runCodeSniffer(php: PHP, code: string, standard: CodingStandard) {
	// Write the PHP code to a temporary file
	php.writeFile('/tmp/check.php', code);
	
	// Create a CodeSniffer check script that uses the preloaded files
	const checkScript = `<?php
// Include the CodeSniffer runner script
require_once '/phpcs/phpcs-runner.php';

$file = '/tmp/check.php';
$standard = '${standard}';

try {
    $result = runCodeSniffer($file, $standard);
    echo $result;
} catch (Exception $e) {
    echo "Error running CodeSniffer: " . $e->getMessage();
}
`;

	const output = php.run({
		code: checkScript,
	});
	return new TextDecoder().decode(output.body);
}

// Convert code to PHP code for CodeSniffer checking
export function convertCodeForCodeSniffer(code: string) {
	const phpPrefixPattern = /^<\?(php)?\s*/g;
	const hasPhpPrefix = code.match(phpPrefixPattern);
	
	// Ensure proper PHP opening tag for CodeSniffer
	if (!hasPhpPrefix) {
		return '<?php\n' + code;
	}
	return code;
}

export function useCodeSniffer(version: Version, code: string, standard: CodingStandard): [boolean, string] {
	const [php, setPHP] = useState<PHP | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [internalCode, setInternalCode] = useState<string>('');
	const [internalStandard, setInternalStandard] = useState<CodingStandard>(standard);
	const [result, setResult] = useState<string>('');

	const phpCode = convertCodeForCodeSniffer(code);

	useEffect(
		function () {
			if (php?.version != version) {
				setLoading(true);
				queueMicrotask(async function () {
					setPHP(await initPHP(version));
				});
				return;
			}

			if (internalCode != phpCode || internalStandard != standard) {
				setLoading(true);
				setInternalCode(phpCode);
				setInternalStandard(standard);
				return;
			}
			
			if (!loading) {
				return;
			}

			if (internalCode == '') {
				setResult('Please enter PHP code to check');
				setLoading(false);
				return;
			}

			setTimeout(async function () {
				try {
					const info = await runCodeSniffer(php, internalCode, internalStandard);
					setResult(info);
				} catch (error) {
					// Check if this is due to missing CodeSniffer
					if (internalCode.includes('class_exists') || internalCode.includes('runCodeSniffer')) {
						setResult('Error: PHP_CodeSniffer not available.\n\nTo enable CodeSniffer functionality:\n1. Build WebAssembly with: make build\n2. This will include PHP_CodeSniffer in the WASM build\n\nCurrently showing UI structure for development.');
					} else {
						setResult('Error: ' + (error instanceof Error ? error.message : String(error)));
					}
				}
				setLoading(false);
			}, 15);
		},
		[php, code, internalCode, loading, version, standard, internalStandard]
	);

	return [loading, result];
}
