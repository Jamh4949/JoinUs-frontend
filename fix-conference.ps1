$file = "src/pages/Conference/Conference.scss"
$content = Get-Content $file -Raw

# 1. Add overflow: hidden to .conference
if ($content -notmatch 'overflow: hidden;') {
    $content = $content -replace '(\.conference \{[^\r\n]+\r\n[^\r\n]+\r\n\s+background: #0a0e27;)', '$1`r`n  overflow: hidden;'
}

# 2. Fix message bubbles with classic chat tails
$messageBlock = @'
  &__message {
    max-width: 75%;
    padding: 0.75rem 1rem;
    border-radius: 1.2rem;
    animation: slideIn 0.3s ease;
    position: relative;
    align-self: flex-start;
    background: rgba(60, 60, 80, 0.9);
    margin-bottom: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.1);

    // Classic tail for others' messages (left side)
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: -10px;
      width: 0;
      height: 0;
      border: 10px solid transparent;
      border-right-color: rgba(60, 60, 80, 0.9);
      border-left: 0;
      border-bottom: 0;
      margin-top: -5px;
    }

    // Own messages styling
    &--own {
      align-self: flex-end;
      background: linear-gradient(135deg, rgba(63, 232, 171, 0.35), rgba(120, 205, 205, 0.35));
      border: 2px solid rgba(63, 232, 171, 0.5);
      box-shadow: 0 2px 12px rgba(63, 232, 171, 0.2);

      // Classic tail for own messages (right side)
      &::after {
        left: auto;
        right: -10px;
        border-right-color: transparent;
        border-left-color: rgba(63, 232, 171, 0.35);
        border-left: 10px solid rgba(63, 232, 171, 0.35);
        border-right: 0;
      }

      .conference__message-user {
        color: var(--medium-turquoise);
        font-weight: 700;
      }
    }
  }
'@

# Replace the entire message block
$content = $content -replace '(?s)&__message \{.*?^\s{2}\}', $messageBlock -replace '\r\n', "`r`n"

Set-Content $file -Value $content -NoNewline
Write-Host "Conference.scss updated with classic chat bubbles!"
