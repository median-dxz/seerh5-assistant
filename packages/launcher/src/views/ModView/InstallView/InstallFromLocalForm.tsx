import Close from '@mui/icons-material/Close';
import CloudUpload from '@mui/icons-material/CloudUploadRounded';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    styled,
    Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useRef, useState } from 'react';

import { IS_DEV } from '@/constants';
import { mod } from '@/features/mod';
import { modApi } from '@/services/mod';
import { useAppDispatch } from '@/shared';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1
});

export function InstallFromLocalForm() {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useAppDispatch();
    const [install] = modApi.useInstallMutation();

    const [open, setOpen] = useState(false);
    const [modFile, setModFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const uploadModRef = useRef<HTMLInputElement>(null);

    const handleClose = useCallback(() => {
        setOpen(false);
        setModFile(null);
    }, []);

    const handleSelectFile = useCallback((v: React.ChangeEvent<HTMLInputElement>) => {
        if (v.target.files && v.target.files.length > 0) {
            const file = v.target.files[0];
            if (file.name.endsWith('.js')) {
                setModFile(file);
            }
        }
    }, []);

    if (!IS_DEV) {
        return null;
    }

    return (
        <>
            <Button
                variant="outlined"
                onClick={() => {
                    setOpen(true);
                }}
            >
                从本地安装
            </Button>
            <Dialog
                open={open}
                onClose={(e, reason) => {
                    if (reason === 'backdropClick') {
                        return;
                    } else if (uploading) {
                        enqueueSnackbar('模组安装中...', { variant: 'warning' });
                    } else {
                        handleClose();
                    }
                }}
                PaperProps={{
                    sx: {
                        backgroundImage: 'none',
                        bgcolor: ({ palette }) => palette.extendedBackground.popup,
                        backdropFilter: 'blur(4px)'
                    },
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();

                        if (!modFile) {
                            enqueueSnackbar('请选择模组文件...', { variant: 'info' });
                            return;
                        }

                        setUploading(true);

                        const modUrl = URL.createObjectURL(modFile);

                        void install({ url: modUrl, update: true })
                            .then(async (result) => {
                                if (!result.error) {
                                    await dispatch(mod.deploy(result.data));
                                    enqueueSnackbar(`模组${result.data}安装成功!`, { variant: 'success' });
                                } else if (result.error) {
                                    // eslint-disable-next-line @typescript-eslint/only-throw-error
                                    throw result.error;
                                }
                            })
                            .catch((error: unknown) => {
                                console.error(error);
                                enqueueSnackbar('模组安装失败, 查看日志获取详情', { variant: 'error' });
                            })
                            .finally(() => {
                                URL.revokeObjectURL(modUrl);
                                setUploading(false);
                                handleClose();
                            });
                    }
                }}
            >
                <DialogTitle>从本地安装</DialogTitle>
                <IconButton
                    aria-label="close"
                    disabled={uploading}
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8
                    }}
                >
                    <Close />
                </IconButton>
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 4
                    }}
                >
                    <Typography>注意: 本地上传模组为开发者功能, 将始终覆盖安装现有模组</Typography>
                    <FormControl variant="standard" fullWidth>
                        <InputLabel htmlFor="mod-file">模组文件</InputLabel>
                        <Input
                            id="mod-file"
                            title="模组文件"
                            aria-label="mod file"
                            autoComplete="off"
                            value={modFile?.name ?? ''}
                            sx={{
                                fontFamily: ({ fonts }) => fonts.input
                            }}
                            endAdornment={
                                <UploadEndAdornment file={modFile} fileInputRef={uploadModRef} setFile={setModFile} />
                            }
                        />
                        <VisuallyHiddenInput
                            ref={uploadModRef}
                            type="file"
                            name="upload-mod"
                            accept="text/javascript"
                            onChange={handleSelectFile}
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" type="submit" disabled={!modFile || uploading}>
                        {uploading ? '安装中...' : '安装'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

interface UploadEndAdornmentProps {
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

const UploadEndAdornment = ({ file, fileInputRef, setFile }: UploadEndAdornmentProps) => (
    <InputAdornment position="end">
        {file && (
            <IconButton
                color="primary"
                aria-label="clear"
                onMouseDown={(e) => {
                    e.preventDefault();
                }}
                onClick={() => {
                    setFile(null);
                }}
            >
                <Close fontSize="small" />
            </IconButton>
        )}
        <IconButton
            color="primary"
            onMouseDown={(e) => {
                e.preventDefault();
            }}
            onClick={() => {
                fileInputRef.current?.click();
            }}
        >
            <CloudUpload fontSize="small" />
        </IconButton>
    </InputAdornment>
);
