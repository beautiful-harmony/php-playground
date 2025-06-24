import * as React from 'react';
import { useEffect } from 'react';
import {
	Flex,
	Box,
	Spacer,
	Text,
	Link,
	Center,
	Button,
	Switch,
	useColorMode,
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import * as lzstring from 'lz-string';

import { Version, asVersion } from './php-wasm/php';
import SelectPHP from './select';
import { Editor } from './editor';
import { BellIcon } from '@chakra-ui/icons';
import { CodingStandard, SelectCodingStandard } from './format';

type UrlState = {
	v: Version;
	c: string;
	s: CodingStandard;
};

export default function App() {
	const [searchParams, setSearchParams] = useSearchParams();
	const initCode =
		lzstring.decompressFromEncodedURIComponent(
			searchParams.get('c') ?? ''
		) ?? '<?php\n// Example PHP code for coding standard check\nclass exampleClass {\n    public function test(){\n        echo "hello world";\n    }\n}';

	const currentVersion = asVersion(searchParams.get('v')) ?? '8.4';

	const { colorMode, toggleColorMode } = useColorMode();

	const currentStandard = (searchParams.get('s') as CodingStandard) ?? 'PSR12';

	function updateVersion(v: Version) {
		const currentState = history.state as UrlState | null;
		const code = lzstring.decompressFromEncodedURIComponent(
			currentState?.c ?? initCode
		);
		const standard = currentState?.s ?? currentStandard;
		if (code == null) {
			return;
		}
		setSearchParams({
			v: v,
			c: lzstring.compressToEncodedURIComponent(code),
			s: standard,
		});
		setHistory(code, v, standard);
	}

	function setHistory(code: string, version: Version, standard: CodingStandard) {
		const state: UrlState = {
			c: lzstring.compressToEncodedURIComponent(code),
			v: version,
			s: standard,
		};
		const urlSearchParam = new URLSearchParams(state).toString();
		// Only push to history.
		// I don't want to have it re-render with a URL change when the code changes.
		history.pushState(state, '', `?${urlSearchParam}`);
	}

	useEffect(
		function () {
			updateVersion(currentVersion);
			updateStandard(currentStandard);
		},
		[currentVersion, currentStandard]
	);

	function updateStandard(standard: CodingStandard) {
		const currentState = history.state as UrlState | null;
		const code = lzstring.decompressFromEncodedURIComponent(
			currentState?.c ?? initCode
		);
		const version = currentState?.v ?? currentVersion;
		if (code == null) {
			return;
		}
		setSearchParams({
			v: version,
			c: lzstring.compressToEncodedURIComponent(code),
			s: standard,
		});
		setHistory(code, version, standard);
	}

	return (
		<main style={{ margin: '16px' }}>
			<Flex marginTop="8px" marginBottom="8px" gap="16px">
				<Box marginTop="auto" marginBottom="auto">
					<Text fontSize="lg" fontWeight="bold" color="blue.500">
						🔍 PHP CodeSniffer Playground
					</Text>
					<Text fontSize="xs" color="gray.500">
						Check your PHP code against coding standards
					</Text>
				</Box>
				<Spacer />
				<Flex direction={{ base: 'column', lg: 'row' }} gap="16px">
					<Center>
						<Button
							leftIcon={<BellIcon />}
							href="https://github.com/sponsors/glassmonkey"
							as="a"
							colorScheme="green"
						>
							Donate
						</Button>
					</Center>
					<label
						style={{
							marginTop: 'auto',
							marginBottom: 'auto',
						}}
					>
						<Text fontSize="xs">Version:</Text>
					</label>
					<SelectPHP
						onChange={updateVersion}
						version={currentVersion}
					/>
					<Flex direction="row" gap={'8px'} alignItems={'center'}>
						<Text fontSize="xs">UI Theme:</Text>
						<Switch
							variant="colormodeSwitcher"
							size="lg"
							fontSize="lg"
							isChecked={colorMode === 'light'}
							onChange={toggleColorMode}
							mr={2}
						/>
					</Flex>
					<SelectCodingStandard
						standard={currentStandard}
						updateStandard={updateStandard}
					/>
				</Flex>
			</Flex>
			<Editor
				initCode={initCode}
				version={currentVersion}
				standard={currentStandard}
				onChangeCode={function (code: string) {
					setHistory(code, currentVersion, currentStandard);
				}}
			/>
		</main>
	);
}
