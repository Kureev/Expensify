// @ts-expect-error - This line imports a module from 'pdfjs-dist' package which lacks TypeScript typings.
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {Document, pdfjs, Thumbnail} from 'react-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import type PDFThumbnailProps from './types';

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
}

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, onPassword}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const [hasError, setHasError] = useState(false);

    const thumbnail = useMemo(
        () => (
            <Document
                loading={<FullScreenLoadingIndicator />}
                file={isAuthTokenRequired ? addEncryptedAuthTokenToURL(previewSourceURL) : previewSourceURL}
                options={{
                    cMapUrl: 'cmaps/',
                    cMapPacked: true,
                }}
                externalLinkTarget="_blank"
                onPassword={onPassword}
                onLoad={() => {
                    setHasError(false);
                }}
                onLoadError={() => {
                    setHasError(true);
                }}
                error={
                    <View style={[styles.justifyContentCenter, styles.moneyRequestViewImage, styles.moneyRequestAttachReceipt, styles.mv0, styles.mh0, styles.alignItemsCenter]}>
                        <Icon
                            src={Expensicons.ReceiptSlash}
                            width={72}
                            height={72}
                            fill={theme.icon}
                        />
                    </View>
                }
            >
                <View pointerEvents="none">
                    <Thumbnail pageIndex={0} />
                </View>
            </Document>
        ),
        [isAuthTokenRequired, previewSourceURL, onPassword, styles, theme],
    );

    return (
        <View style={[style, styles.overflowHidden]}>
            <View style={[styles.w100, styles.h100, !hasError && styles.alignItemsCenter, !hasError && styles.justifyContentCenter]}>{enabled && thumbnail}</View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';
export default React.memo(PDFThumbnail);
