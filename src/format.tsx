import { Select, Text, Flex } from '@chakra-ui/react';
import * as React from 'react';

export type CodingStandard = 'PSR12' | 'PEAR';

export function SelectCodingStandard({
	standard,
	updateStandard,
}: {
	standard: CodingStandard;
	updateStandard: (s: CodingStandard) => void;
}) {
	return (
		<Flex direction="row" gap={'8px'} alignItems={'center'}>
			<Text fontSize="xs" whiteSpace="nowrap">Coding Standard:</Text>
			<Select
				data-testid="select-coding-standard"
				value={standard}
				onChange={(e) => updateStandard(e.target.value as CodingStandard)}
				size="sm"
				width="120px"
			>
				<option value="PSR12">PSR-12</option>
				<option value="PEAR">PEAR</option>
			</Select>
		</Flex>
	);
}
