import type { PanelColumns } from '@/components/PanelTable';

export const taskViewColumns: PanelColumns = [
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
        columnName: '完成状态'
    },
    {
        field: 'actions',
        columnName: ''
    }
];
