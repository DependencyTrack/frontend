import { expect, it } from 'vitest';
import ProjectList from './ProjectList.vue';

it('keeps selected project UUIDs in sync with the table', () => {
  let selected = [{ uuid: 'first' }, { uuid: 'second' }];
  const context = {
    $refs: { table: { getSelections: () => selected } },
    selectedProjectUuids: [],
  };

  ProjectList.methods.updateSelectedProjectUuids.call(context);
  expect(context.selectedProjectUuids).toEqual(['first', 'second']);

  selected = [];
  ProjectList.methods.updateSelectedProjectUuids.call(context);
  expect(context.selectedProjectUuids).toEqual([]);
});
