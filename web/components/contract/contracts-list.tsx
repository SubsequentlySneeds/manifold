import { Contract } from 'common/contract'
import { ContractCard } from './contract-card'
import { Col } from '../layout/col'
import { VisibilityObserver } from '../widgets/visibility-observer'
import { useCallback, useState } from 'react'
import { LoadingIndicator } from '../widgets/loading-indicator'
import { ContractsListEntry } from './contracts-list-entry'
import { useIsMobile } from 'web/hooks/use-is-mobile'
import {
  useFloating,
  useHover,
  useInteractions,
  safePolygon,
} from '@floating-ui/react'

const contractListEntryHighlightClass =
  'bg-gradient-to-b from-indigo-100 via-white to-white outline outline-2 outline-indigo-400'
export function ContractsList(props: {
  contracts: Contract[] | undefined
  loadMore?: () => void
  onContractClick?: (contract: Contract) => void
  highlightContractIds?: string[]
}) {
  const { contracts, loadMore, onContractClick, highlightContractIds } = props
  const onVisibilityUpdated = useCallback(
    (visible: boolean) => {
      if (visible && loadMore) {
        loadMore()
      }
    },
    [loadMore]
  )

  const isMobile = useIsMobile()

  if (contracts === undefined) {
    return <LoadingIndicator />
  }

  return (
    <Col>
      {contracts.map((contract) =>
        isMobile ? (
          <ContractsListEntry
            contract={contract}
            key={contract.id}
            onContractClick={onContractClick}
            className={
              highlightContractIds?.includes(contract.id)
                ? contractListEntryHighlightClass
                : ''
            }
          />
        ) : (
          <DesktopPopover
            contract={contract}
            key={contract.id}
            onContractClick={onContractClick}
            highlightContractIds={highlightContractIds}
          ></DesktopPopover>
        )
      )}

      {loadMore && (
        <VisibilityObserver
          onVisibilityUpdated={onVisibilityUpdated}
          className="relative -top-96 h-1"
        />
      )}
    </Col>
  )
}

function DesktopPopover(props: {
  contract: Contract
  onContractClick?: (contract: Contract) => void
  highlightContractIds?: string[]
}) {
  const { contract, onContractClick, highlightContractIds } = props
  const [isOpen, setIsOpen] = useState(false)
  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-end',
  })
  const hover = useHover(context, {
    mouseOnly: true,
    handleClose: safePolygon({ buffer: -Infinity }),
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover])
  return (
    <>
      <ContractsListEntry
        ref={refs.setReference}
        contract={contract}
        onContractClick={onContractClick}
        className={
          highlightContractIds?.includes(contract.id)
            ? contractListEntryHighlightClass
            : ''
        }
        {...getReferenceProps()}
      />
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
          {...getFloatingProps()}
        >
          <ContractCard
            contract={contract}
            showImage
            showDescription
            className="w-[350px]"
          />
        </div>
      )}
    </>
  )
}
