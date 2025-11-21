import React from 'react'

import { alpha, ThemeProvider, createTheme } from '@mui/material/styles'

// https://mui.com/material-ui/customization/theming/#typescript
declare module '@mui/material/styles' {
  interface Theme {
    lightBackground: string
    inputBorder: string
    statusColours: {
      blue: {
        background: string
        text: string
      }
      pink: {
        background: string
        text: string
      },
      green: {
        background: string
        text: string
      }
    }
  }

  interface ThemeOptions {
    lightBackground: string
    inputBorder: string
    statusColours: {
      blue: {
        background: string
        text: string
      }
      pink: {
        background: string
        text: string
      },
      green: {
        background: string
        text: string
      }
    }
  }

  interface CommonColors {
    grey: string
    navUnselected: string
    inputBackground: string
  }

  interface TypographyVariants {
    largeCallout: React.CSSProperties
    colourHeading: React.CSSProperties
    largeBody: React.CSSProperties
    landingLink: React.CSSProperties
    landingCopyright: React.CSSProperties
    footer: React.CSSProperties
    cardType: React.CSSProperties
    secondarySurveyTitles: React.CSSProperties
  }

  interface TypographyVariantsOptions {
    largeCallout?: React.CSSProperties
    colourHeading?: React.CSSProperties
    largeBody?: React.CSSProperties
    landingLink?: React.CSSProperties
    landingCopyright?: React.CSSProperties
    cardType?: React.CSSProperties
    footer?: React.CSSProperties
    secondarySurveyTitle?: React.CSSProperties
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    largeCallout: true
    colourHeading: true
    largeBody: true
    landingLink: true
    landingCopyright: true
    cardType: true
    footer: true
    secondarySurveyTitle: true
  }
}

// Update the Button's variant prop options
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    outlinedGreyscale: true
  }
}

const ThemeProviderWrapper = (props) => {
  // Use theme composition to define colour variables, fonts, etc
  // that may be reused elsewhere in the theme
  // https://mui.com/material-ui/customization/theming/ [Theme composition: using theme options to define other options]
  const coreTheme = createTheme({
    palette: {
      primary: {
        main: '#052764'
      },
      secondary: {
        main: '#03358e'
      },
      common: {
        grey: '#F6F6F6',
        navUnselected: '#5C5F62',
        inputBackground: '#F9F9FD'
      }
    },
    statusColours: {
      blue: {
        background: '#E1EEFF',
        text: '#063CC9'
      },
      pink: {
        background: '#FFE0FF',
        text: '#9A3486'
      },
      green: {
        background: '#E0FFC1',
        text: '#1E5B57'
      }
    },
    lightBackground: '#E0E8F7',
    inputBorder: '#589BFF',
    typography: {
      fontFamily: ['Plus Jakarta Sans', 'sans-serif'].join(','),
      h5: {
        fontWeight: 700
      },
      h6: {
        fontWeight: 700
      }
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 375, // mobile
        md: 768, // tablet
        lg: 1152, // laptop
        xl: 1440 // desktop
      }
    },
    spacing: 8 // This is the default anyway
  })

  const theme = createTheme(coreTheme, {
    typography: {

      /* Landing page styles */
      h1: { // Large text, like headers on the landing page
        fontWeight: 400,
        fontSize: '3rem', // 48px
        lineHeight: 1.67,
        letterSpacing: 0,
        [coreTheme.breakpoints.down('xs')]: {
          fontSize: '2.5rem', // 40px
          lineHeight: 1.4
        }
      },
      h2: { // Section heading on landing page (this may be a one-off style)
        fontWeight: 700,
        fontSize: '1.75rem', // 28px
        lineHeight: 1.21,
        letterSpacing: 0,
        transform: 'uppercase',
        color: '#3E68B6' // TODO: should this be a theme colour or a one-off
      },
      largeCallout: { // Larger callout text like on landing page
        fontWeight: 500,
        fontSize: '2.188rem', // 35px
        lineHeight: 1,
        letterSpacing: '0.011rem',
        [coreTheme.breakpoints.down('xs')]: {
          fontSize: '1.75rem' // 28px
        }
      },
      colourHeading: {
        textTransform: 'uppercase',
        color: '#3E68B6', // not sure if this is a new theme colour
        fontWeight: 700,
        fontSize: '1.75rem', // 28px
        lineHeight: 1.21,
        letterSpacing: 0
      },
      largeBody: {// Larger paragraph text like on landing page
        fontWeight: 400,
        fontSize: '1.5rem', // 24px
        lineHeight: 1.25,
        letterSpacing: '0.011rem' // 0.18px
      },
      landingLink: {
        fontWeight: 500,
        fontSize: '1rem', // 16px
        lineHeight: 1.5,
        letterSpacing: '0.013'
      },
      landingCopyright: {
        fontWeight: 300,
        fontSize: '1rem', // 16px
        lineHeight: 1,
        letterSpacing: '0.013'
      },


      /* Portal styles */
      h4: { // dashboard headers
        fontWeight: 600,
        fontSize: '1.875rem', // 30px
        lineHeight: 1.26,
        letterSpacing: 0
      },
      h5: { // login/registration headers
        fontWeight: 700,
        fontSize: '1.25rem', // 20px
        lineHeight: 1.5,
        letterSpacing: 0
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.25rem', // 20px
        lineHeight: 1.2,
        letterSpacing: '0.009rem'
      },
      body1: {
        fontWeight: 400,
        fontSize: '1rem', // 16px
        lineHeight: 1.5,
        letterSpacing: 0
      },
      body2: {
        fontWeight: 700,
        fontSize: '0.813rem', // 13px
        lineHeight: 1.5,
        letterSpacing: 0
      },
      button: {
        fontWeight: 700,
        fontSize: '1rem', // 16px
        lineHeight: 1.25,
        letterSpacing: '0.078rem', // 1.25px
        textTransform: 'uppercase'
      },
      caption: {
        fontWeight: 500,
        fontSize: '0.813rem', // 13px
        lineHeight: 1.5,
        letterSpacing: 0
      },
      footer: {
        fontWeight: 400,
        fontSize: '0.75rem', // 12px
        lineHeight: 1.33,
        letterSpacing: '0.025rem' // 0.4px
      },
      cardType: {
        fontWeight: 500,
        fontSize: '0.625rem', // 10px
        lineHeight: 1.6,
        letterSpacing: '0.094rem',
        textTransform: 'uppercase'
      },
      secondarySurveyTitle: {
        textTransform: 'uppercase',
        fontWeight: 500,
        fontSize: '0.938rem', // 15px
        lineHeight: 1,
        letterSpacing: '0.094rem' // 1.5px
      }
    },

    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          size: 'large'
        },
        variants: [
          {
            props: { variant: 'outlinedGreyscale' },
            style: {
              color: '#1F1F1F',
              border: '0.063rem solid #D9D9D9',
              borderRadius: coreTheme.spacing(6),
              '&:hover': {
                backgroundColor: 'rgba(217, 217, 217, 0.04)' // Example: hover effect
              }
            }
          }
        ],
        styleOverrides: {
          contained: {
            borderRadius: coreTheme.spacing(6),
            color: coreTheme.palette.common.white
          },
          containedSecondary: {
            backgroundColor: coreTheme.palette.common.white,
            color: 'black'
          },
          outlined: {
            borderRadius: coreTheme.spacing(6),
            borderColor: coreTheme.palette.primary.main,
            '&:hover': {
              borderColor: coreTheme.palette.secondary.main,
              backgroundColor: `${coreTheme.palette.secondary.main}4D`
            }
          },
          outlinedSecondary: {
            borderColor: coreTheme.palette.common.white,
            color: coreTheme.palette.common.white,
            '&:hover': {
              borderColor: coreTheme.palette.common.white,
              backgroundColor: `${coreTheme.palette.common.white}4D`
            }
          },
          sizeLarge: {
            padding: coreTheme.spacing(1.35, 3) // 12px 24px
          },
          text: {
            fontSize: '1rem', // 16px,
            lineHeight: 1.5,
            color: coreTheme.palette.secondary.main,
            borderRadius: coreTheme.spacing(6),
            '&:hover': {
              backgroundColor: coreTheme.palette.grey[300],
              color: 'black'
            }
          }
        }
      },

      MuiTypography: {
        defaultProps: {
          gutterBottom: false,
          variantMapping: {
            largeCallout: 'p',
            colourHeading: 'p',
            largeBody: 'p',
            landingLink: 'a',
            landingCopyright: 'p'
          }
        }
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: '0.813rem', // 13px
            fontWeight: 500,
            lineHeight: '150%',
            letterSpacing: 0,
            marginBottom: coreTheme.spacing(1) // 8px
          }
        }
      },

      MuiDialog: {
        styleOverrides: {
          paperWidthMd: {
            maxWidth: '37.5rem' // 600px
          }
        }
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: '3rem 1.5rem 1rem 1.5rem'
          }
        }
      },

      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: '1rem 1.5rem 0'
          }
        }
      },

      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '2.25rem 1.5rem 1.5rem 1.5rem'
          }
        }
      },

      MuiFormLabel: {
        styleOverrides: {
          root: {
            display: 'block',
            color: coreTheme.palette.primary.main,
            fontWeight: 700,
            lineHeight: '150%',
            marginBottom: coreTheme.spacing(1.5),
            borderLeft: `0.188rem solid transparent`,
            '&.Mui-error': {
              color: coreTheme.palette.error.main,
              borderLeft: `0.188rem solid ${coreTheme.palette.primary.main}`
            },
            '&.Mui-disabled': {
              color: coreTheme.palette.common.black,
            }
          }
        }
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: coreTheme.palette.common.inputBackground,
            color: coreTheme.palette.primary.main
          },
          notchedOutline: {
            borderColor: coreTheme.inputBorder,
            '&:hover': {
              borderColor: coreTheme.palette.secondary.main
            },
            '&.Mui-focused': {
              borderColor: coreTheme.palette.secondary.main
            },
            '&.Mui-active': {
              borderColor: coreTheme.palette.secondary.main
            }
          }
        }
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: coreTheme.palette.primary.main
          }
        }
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            color: coreTheme.palette.common.navUnselected,
            borderLeft: `0.313rem solid transparent`,
            '&.Mui-selected': {
              backgroundColor: alpha(coreTheme.palette.primary.main, 0.08),
              color: coreTheme.palette.primary.main,
              borderLeft: `0.313rem solid ${coreTheme.palette.primary.main}`
            }
          }
        }
      },

      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontWeight: 500,
            fontSize: '0.875rem', // 14px
            lineHeight: 1.71,
            letterSpacing: '0.006rem' // 0.1px
          }
        }
      }

    }
  })

  return (
    <ThemeProvider theme={theme}>
      {props.children}
    </ThemeProvider>
  );
}

export default ThemeProviderWrapper
