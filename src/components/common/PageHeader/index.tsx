import { Box, Typography } from '@mui/material'
import classnames from 'classnames'

import type { ReactElement } from 'react'

import css from './styles.module.css'

const PageHeader = ({
  title,
  action,
  noBorder,
}: {
  title: string
  action?: ReactElement
  noBorder?: boolean
}): ReactElement => {
  return (
    <Box className={classnames(css.container, { [css.border]: !noBorder })}>
      <Typography variant="h3" className={css.title}>
        {title}
      </Typography>
      {action}
    </Box>
  )
}

export default PageHeader
