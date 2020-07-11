window.onload = () => {
  const chartArea = document.getElementById("chartCanvas");
  const radar = renderRadar(chartArea);
  onRadarLabelClicked(chartArea, radar, (...vals) => {
    alert(
      "key: " +
        vals[0] +
        "\n" +
        "ラベルの文字: " +
        vals[1] +
        "ラベル中央の縦の位置: " +
        vals[2] +
        "\n" +
        "ラベル中央の横の位置: " +
        vals[3]
    );
  });
};

const renderRadar = (target) => {
  const colorA = "pink";
  const colorB = "blue";
  const label = [
    "ねこちゃん",
    "わんちゃん",
    "おさかなさん",
    "とりさん",
    "むしさん",
    "にんげんさん",
    "かめさん",
  ];
  return new Chart(target.getContext("2d"), {
    type: "radar",
    data: {
      labels: label,
      datasets: [
        {
          label: "子供の頃好きだったレベル",
          data: label.map(() => Math.floor(Math.random() * 100)),
          fill: true,
          backgroundColor: "transparent",
          borderColor: colorA,
          pointBackgroundColor: colorA,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: colorA,
        },
        {
          label: "大人になってからの好きレベル",
          data: label.map(() => Math.floor(Math.random() * 100)),
          fill: true,
          backgroundColor: "transparent",
          borderColor: colorB,
          pointBackgroundColor: colorB,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: colorB,
        },
      ],
    },
    options: {
      scale: {
        ticks: {
          stepSize: 20,
        },
      },
      elements: {
        line: {
          tension: 0,
          borderWidth: 3,
        },
      },
    },
  });
};

const onRadarLabelClicked = (chartArea, radar, callback) => {
  // ラベルがクリックされたか判定しつつlabelがクリックされたらイベントを実施する
  // 以下から引用しコメントを意訳 + es6っぽく + callbackに引数を追加したり。
  // https://stackoverflow.com/a/58296237
  chartArea.onclick = (e) => {
    const helpers = Chart.helpers;
    const scale = radar.scale;
    const opts = scale.options;
    const tickOpts = opts.ticks;

    // canvas内のクリックしたx,y値
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const labelPadding = 5; // labelのわまり5pxは余白として持つ

    // レーダーチャートのラベルのレンダリング位置を取得
    // scale.radialLinear.jsのdrawPointLabels()から計算する
    const tickBackdropHeight =
      tickOpts.display && opts.display
        ? helpers.valueOrDefault(
            tickOpts.fontSize,
            Chart.defaults.global.defaultFontSize
          ) + 5
        : 0;
    const outerDistance = scale.getDistanceFromCenterForValue(
      opts.ticks.reverse ? scale.min : scale.max
    );
    for (var i = 0; i < scale.pointLabels.length; i++) {
      // 軸ラベルによってチャート上部に余分な空白があるので削除
      const extra = i === 0 ? tickBackdropHeight / 2 : 0;
      const pointLabelPosition = scale.getPointPosition(
        i,
        outerDistance + extra + 5
      );

      // ラベルサイズ情報を取得
      const plSize = scale._pointLabelSizes[i];

      // ラベルのtextAlignを取得する(ラベルの描画位置が変わるので)
      const angleRadians = scale.getIndexAngle(i);
      const angle = helpers.toDegrees(angleRadians);
      let textAlign = "right";
      if (angle == 0 || angle == 180) {
        textAlign = "center";
      } else if (angle < 180) {
        textAlign = "left";
      }

      // ラベルの垂直オフセット位置を取得
      // drawPointLabels()から取得し計算
      let verticalTextOffset = 0;
      if (angle === 90 || angle === 270) {
        verticalTextOffset = plSize.h / 2;
      } else if (angle > 270 || angle < 90) {
        verticalTextOffset = plSize.h;
      }

      // 対象のラベルの範囲の位置を計算(padding含み)
      const labelTop = pointLabelPosition.y - verticalTextOffset - labelPadding;
      const labelHeight = 2 * labelPadding + plSize.h;
      const labelBottom = labelTop + labelHeight;

      const labelWidth = plSize.w + 2 * labelPadding;
      let labelLeft;
      switch (textAlign) {
        case "center":
          labelLeft = pointLabelPosition.x - labelWidth / 2;
          break;
        case "left":
          labelLeft = pointLabelPosition.x - labelPadding;
          break;
        case "right":
          labelLeft = pointLabelPosition.x - labelWidth + labelPadding;
          break;
        default:
          console.warn("WARNING: unknown textAlign " + textAlign);
      }
      let labelRight = labelLeft + labelWidth;

      // クリックされた範囲がラベルか判定
      if (
        mouseX >= labelLeft &&
        mouseX <= labelRight &&
        mouseY <= labelBottom &&
        mouseY >= labelTop
      ) {
        callback(
          i,
          scale.pointLabels[i],
          //ラベル中央のxとyを返却
          labelLeft + labelWidth / 2,
          labelTop + labelHeight / 2
        );
        break; //ラベルクリックがわかったので処理を終了
      }
    }
  };
};
