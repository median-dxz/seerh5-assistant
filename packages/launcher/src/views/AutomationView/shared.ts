import type { PanelColumns } from '@/components/PanelTable';

export const taskViewColumns = [
    {
        field: 'name',
        columnName: '名称'
    },
    {
        field: 'cid',
        columnName: '模组'
    },
    {
        field: 'state',
        columnName: '状态'
    },
    {
        field: 'actions',
        columnName: '操作'
    }
] as const satisfies PanelColumns;
