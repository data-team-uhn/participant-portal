import React from 'react'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ButtonGroup from '@mui/material/ButtonGroup'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'

import Button from 'PORTAL/components/basicComponents/button'

interface Props {
  anchorRef: any
  handleButtonClick: any
  options: Array<string>
  menuIndex: number
  handleToggle: any
  menuOpen: boolean
  handleClose: any
  handleMenuItemClick: (event: any, index: number) => void
}

const ButtonWithMenu = (props: Props) => {
  const {
    anchorRef,
    handleButtonClick,
    options,
    menuIndex,
    handleToggle,
    menuOpen,
    handleClose,
    handleMenuItemClick
  } = props

  return (
    <>
      <ButtonGroup
        disableElevation
        ref={anchorRef}
        variant='contained'
      >
        <Button size='small' sx={{m: 0}} onClick={handleButtonClick}>{options[menuIndex]}</Button>
        <Button
          sx={{m: 0}} 
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select download type"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={menuOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper sx={{ mt: 2 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === menuIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

export default ButtonWithMenu
