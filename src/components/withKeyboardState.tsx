import PropTypes from 'prop-types';
import React, {ComponentType, createContext, ForwardedRef, forwardRef, ReactElement, RefAttributes, useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type KeyboardStateContextValue = {
    /** Whether the keyboard is open */
    isKeyboardShown: boolean;
};

// TODO: Remove - left for backwards compatibility with existing components.
const keyboardStatePropTypes = {
    /** Whether the keyboard is open */
    isKeyboardShown: PropTypes.bool.isRequired,
};

const KeyboardStateContext = createContext<KeyboardStateContextValue | null>(null);

function KeyboardStateProvider(props: ChildrenProps): ReactElement | null {
    const {children} = props;
    const [isKeyboardShown, setIsKeyboardShown] = useState(false);
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardShown(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardShown(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const contextValue = useMemo(
        () => ({
            isKeyboardShown,
        }),
        [isKeyboardShown],
    );
    return <KeyboardStateContext.Provider value={contextValue}>{children}</KeyboardStateContext.Provider>;
}

export default function withKeyboardState<TProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>): (props: TProps & React.RefAttributes<TRef>) => ReactElement | null {
    function WithKeyboardState(props: TProps, ref: ForwardedRef<TRef>) {
        return (
            <KeyboardStateContext.Consumer>
                {(keyboardStateProps) => (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...keyboardStateProps}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        ref={ref}
                    />
                )}
            </KeyboardStateContext.Consumer>
        );
    }
    WithKeyboardState.displayName = `withKeyboardState(${getComponentDisplayName(WrappedComponent as ComponentType)})`;
    return forwardRef(WithKeyboardState);
}

export {KeyboardStateProvider, keyboardStatePropTypes, type KeyboardStateContextValue, KeyboardStateContext};
