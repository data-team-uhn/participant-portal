import useMediaQuery from '@mui/material/useMediaQuery'

/**
 * Return true if the screen size is less than or equal to the 'md' breakpoint
 */
export default function isOnMobile() {
  return useMediaQuery((theme) => theme.breakpoints.down('md'))
}
