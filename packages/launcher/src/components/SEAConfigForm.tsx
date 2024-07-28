import {
    Dialog,
    DialogTitle,
    DialogContent,
    Stack,
    FormControl,
    InputLabel,
    Select,
    alpha,
    MenuItem,
    FormControlLabel,
    Switch,
    DialogActions,
    Button
} from '@mui/material';
import { toRaw } from '@vue/reactivity';
import { dequal } from 'dequal';
import { enqueueSnackbar } from 'notistack';
import { Controller } from 'react-hook-form';
import { DifficultyText } from '../constants';
import { Row } from './styled/Row';

export interface SEAConfigFormProps {
    open: boolean;
    onClose: (open: boolean) => void;
    config: SEAConfig[];
    mutate: number;
}

export function SEAConfigForm({}: SEAConfigFormProps) {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit((newData) => {
                    newData.battle = newData.battle ?? [];
                    if (!toRaw(modData).some((data) => dequal(data, newData))) {
                        modData.push({ ...newData });
                        handleClose();
                    } else {
                        reset({ ...newData, battle: [] });
                        enqueueSnackbar('配置已存在', { variant: 'warning' });
                    }
                })
            }}
        >
            <DialogTitle>编辑精灵因子配置</DialogTitle>
            <DialogContent>
                <Stack sx={{ pt: 2 }} direction="column">
                    <Row sx={{ alignItems: 'center' }}>
                        <Controller
                            control={control}
                            name="difficulty"
                            render={({ field }) => (
                                <FormControl
                                    sx={{
                                        width: '6rem'
                                    }}
                                >
                                    <InputLabel>难度</InputLabel>
                                    <Select
                                        {...field}
                                        MenuProps={{
                                            MenuListProps: {
                                                sx: { bgcolor: ({ palette }) => alpha(palette.secondary.main, 0.88) }
                                            }
                                        }}
                                        label="难度"
                                    >
                                        {AllDifficulty.map((difficulty) => (
                                            <MenuItem key={difficulty} value={difficulty}>
                                                {DifficultyText[difficulty]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />
                        <Controller
                            control={control}
                            name="sweep"
                            render={({ field }) => <FormControlLabel {...field} control={<Switch />} label="扫荡" />}
                        />
                    </Row>
                    <Controller
                        control={control}
                        disabled={isSweep}
                        name="battle"
                        rules={{
                            validate: (value) => value.length === levelCount || '对战方案数量和关卡不一致'
                        }}
                        render={({ field, fieldState }) => (
                            <PFBattleSelector
                                {...field}
                                errorText={fieldState.error?.message}
                                levelCount={levelCount}
                            />
                        )}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disableRipple type="submit">
                    保存
                </Button>
                <Button onClick={handleClose}>取消</Button>
            </DialogActions>
        </Dialog>
    );
}
