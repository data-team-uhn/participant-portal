// TODO: SVGs are getting stripped from the email
//   When we have a proper logo, we should host it and link to the hosted image (PATH does this)
export const Logo = `
  <mj-text mj-class='big' color='white'>
    Connect
  </mj-text>
`

export const themeColor = '#052764'

export const header = `
  <mj-column background-color='${themeColor}' padding='24px 0px'>
    ${Logo}
  </mj-column>
`

export const head = `
  <mj-head>
    <mj-font name='Plus Jakarta Sans' href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans' />
    <mj-attributes>
      <mj-class name='big' font-size='30px' line-height='24px' padding-bottom='0px' />
      <mj-class name='medium' font-size='15px' line-height='24px' />
      <mj-class name='small' font-size='14px' line-height='20px' />
      <mj-class name='xsmall' font-size='14px' line-height='16px' color='#666666' />
      <mj-all font-family='Plus Jakarta Sans, sans-serif' />
      <mj-column width='100%' />
    </mj-attributes>
    <mj-style inline='inline'>
      .link-nostyle { color: white; text-decoration: none; font-size: 16px; line-height: 22px} .link-blue {color: #7193f7; text-decoration: none}
    </mj-style>
  </mj-head>
`
