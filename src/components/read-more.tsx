import { makeStyles } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { MouseEvent, ReactNode, useCallback, useRef, useState } from "react";

interface Props {
    children: ReactNode,
    collapsedHeight: number,
    moreText: string,
    lessText: string
}

const useStyles = makeStyles(theme => ({
    bottomGradientCollapsed: {
        position: "relative",
        "&:after": {
            position: "absolute",
            display: "block",
            height: "30%",
            bottom: 0,
            left: 0,
            right: 0,
            content: `" "`,
            backgroundImage: `linear-gradient(${fade(theme.palette.background.default, 0)}, ${theme.palette.background.default})`
        }
    },
    linkWrapper: {
        paddingTop: theme.spacing(1)
    },
    root: {
        outline: "none"
    }

}))

export const ReadMore = ({
    children,
    collapsedHeight = 360,
    moreText = "Read more",
    lessText = "Read less"
}: Props) => {
    const rootElRef = useRef<HTMLDivElement>(null)
    const [isIn, setIsIn] = useState<boolean>(false);
    const toggle = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setIsIn(isIn => {
            if (!isIn) {
                // Focus root when opening up so it doesn't scroll out of view
                rootElRef.current?.focus()
            }
            return !isIn
        })
    }, [])
    const classes = useStyles();

    return <div className={classes.root} tabIndex={-1} ref={rootElRef}>
        <div className={!isIn ? classes.bottomGradientCollapsed : ""}>
            <Collapse in={isIn} collapsedHeight={collapsedHeight}>
                <div>
                    {children}
                </div>
            </Collapse>
        </div>
        <div className={classes.linkWrapper}>
            <a href="#" onClick={toggle}>
                {isIn ? lessText : moreText}
            </a>
        </div>
    </div>
}