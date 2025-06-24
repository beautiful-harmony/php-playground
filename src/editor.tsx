import type { Version } from './php-wasm/php';
import {
	SandpackLayout,
	SandpackProvider,
	useActiveCode,
	useSandpack,
} from '@codesandbox/sandpack-react';
import { useCodeSniffer } from './php';
import { Box, Center, Flex, Spinner, useColorMode } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import * as React from 'react';
import MonacoEditor, { type OnChange } from '@monaco-editor/react';
import { CodingStandard } from './format';
import debounce from 'debounce';

function LoadSpinner() {
	return (
		<Center height="100%">
			<Spinner size="xl" />
		</Center>
	);
}

function PhpEditor() {
	const { code, updateCode } = useActiveCode();
	const { sandpack } = useSandpack();
	const { colorMode } = useColorMode();

	const onChangeCode: OnChange = debounce((value) => {
		updateCode(value || '');
	}, 300);

	return (
		<MonacoEditor
			width="100%"
			height="100%"
			language="php"
			theme={colorMode === 'light' ? 'vs' : 'vs-dark'}
			key={sandpack.activeFile}
			defaultValue={code}
			onChange={onChangeCode}
			loading={<LoadSpinner />}
			options={{
				minimap: {
					enabled: false,
				},
			}}
		/>
	);
}

function CodeSnifferResults(params: { version: Version; standard: CodingStandard }) {
	const { sandpack } = useSandpack();
	const { files, activeFile } = sandpack;
	const code = files[activeFile].code;
	const [loading, result] = useCodeSniffer(params.version, code, params.standard);

	if (loading) {
		return <LoadSpinner />;
	}

	return (
		<Box
			height="100%"
			width="100%"
			p={4}
			bg="gray.50"
			borderRadius="md"
			overflow="auto"
		>
			<pre
				style={{
					whiteSpace: 'pre-wrap',
					fontSize: '14px',
					fontFamily: 'Monaco, Consolas, "Courier New", monospace',
					margin: 0,
					color: result.includes('✅') ? '#22c55e' : result.includes('Error:') ? '#ef4444' : '#374151',
				}}
				data-testid="codesniffer-results"
			>
				{result}
			</pre>
		</Box>
	);
}

function PhpCodeCallback(params: { onChangeCode: (code: string) => void }) {
	const { sandpack } = useSandpack();
	const { files, activeFile } = sandpack;
	const code = files[activeFile].code;
	params.onChangeCode(code);
	return <></>;
}

function EditorLayout(params: { Editor: ReactElement; Preview: ReactElement }) {
	return (
		<Flex direction="column" padding="3" bg="gray.800" height="100%">
			<Flex
				justify="space-between"
				direction={{ base: 'column', lg: 'row' }}
				align="center"
				gap="8px"
				height="80vh"
			>
				<Box
					as={SandpackLayout}
					flexDirection={{ base: 'column', lg: 'row' }}
					height={{ base: '50%', lg: '100%' }}
					width={{ base: '100%', lg: '50%' }}
				>
					<Box
						as="span"
						flex="1"
						height="100%"
						maxWidth={{ base: '100%' }}
						position="relative"
						className="group"
					>
						{params.Editor}
					</Box>
				</Box>
				<Box
					height={{ base: '50%', lg: '100%' }}
					width={{ base: '100%', lg: '50%' }}
					style={{
						backgroundColor: '#f9fafb',
						border: '1px solid #e5e7eb',
						borderRadius: '8px',
					}}
				>
					{params.Preview}
				</Box>
			</Flex>
		</Flex>
	);
}

export function Editor(params: {
	initCode: string;
	version: Version;
	standard: CodingStandard;
	onChangeCode: (code: string) => void;
}) {
	return (
		<SandpackProvider
			template="react"
			files={{ '/app.php': params.initCode }}
			options={{
				activeFile: '/app.php', // used to be activePath
				visibleFiles: ['/app.php'], // used to be openPaths
			}}
		>
			<EditorLayout
				Editor={<PhpEditor />}
				Preview={
					<CodeSnifferResults
						version={params.version}
						standard={params.standard}
					/>
				}
			/>
			<PhpCodeCallback onChangeCode={params.onChangeCode} />
		</SandpackProvider>
	);
}
